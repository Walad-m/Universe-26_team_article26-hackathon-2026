"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SessionUser } from "./auth";
import {
  calculateConsumedBudget,
  calculateRemainingBudget,
  validateArbZGWorkingHours,
  validateCumulativeDailyHours,
  validateBookingBudget,
} from "@/app/domain/budget";
import {
  canBookTime,
  canAccessContractorPortal,
  filterBookingsForContractor,
} from "@/app/domain/permissions";

const SESSION_COOKIE_NAME = "orvix_session";

export interface PortalOrderData {
  orderId: string;
  orderNumber: string;
  portalToken: string;
  title: string;
  description: string | null;
  totalBudgetDays: number;
  hourlyRate: number;
  startDate: string;
  endDate: string;
  companyId: string;
  supplierName: string;
  dailyHoursPerDay: number;
  consumedDays: number;
  remainingDays: number;
  bookings: Array<{
    id: string;
    userId: string;
    date: string;
    hours: number;
    personDays: number;
    description: string;
    attachmentUrl?: string | null;
    consultantName: string;
    status: "submitted" | "approved" | "rejected" | "extension_requested";
    rejectionReason?: string | null;
  }>;
}

/**
 * Fetches order portal data with strict contractor peer isolation
 * (Each consultant ONLY sees their own bookings, never peer contractor work)
 */
export async function getPortalData(token: string, sessionUserId?: string): Promise<PortalOrderData | null> {
  const order = await prisma.purchaseOrder.findUnique({
    where: { portalToken: token },
    include: {
      company: true,
      bookings: {
        include: { user: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  // Macro budget consumption is computed across all approved/submitted bookings for the contract
  const consumedDays = calculateConsumedBudget(order.bookings, order.dailyHoursPerDay);
  const remainingDays = calculateRemainingBudget(order.totalBudgetDays, consumedDays);

  const rawBookings = order.bookings.map((b) => ({
    id: b.id,
    userId: b.userId,
    date: b.date.toISOString().split("T")[0],
    hours: b.hours,
    personDays: Number((b.hours / order.dailyHoursPerDay).toFixed(2)),
    description: b.description,
    attachmentUrl: b.attachmentUrl,
    consultantName: b.user?.name || "Contractor Specialist",
    status: b.status as "submitted" | "approved" | "rejected" | "extension_requested",
    rejectionReason: b.rejectionReason,
  }));

  // Peer Isolation Rule (docs/roles-and-privacy.md):
  // External Consultant can ONLY see their own submitted deliverables.
  // Deliverables from other contractors on this order are strictly filtered out.
  const ownBookings = sessionUserId
    ? filterBookingsForContractor(rawBookings, sessionUserId)
    : [];

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    portalToken: order.portalToken || token,
    title: order.title,
    description: order.description,
    totalBudgetDays: order.totalBudgetDays,
    hourlyRate: order.hourlyRate || 100.0,
    startDate: order.startDate.toISOString().split("T")[0],
    endDate: order.endDate.toISOString().split("T")[0],
    companyId: order.companyId,
    supplierName: order.company.name,
    dailyHoursPerDay: order.dailyHoursPerDay,
    consumedDays,
    remainingDays,
    bookings: ownBookings,
  };
}

/**
 * Registers an external partner specialist and signs them in to the portal
 * Strictly enforces contractor-only role and supplier organization isolation
 */
export async function signupPartnerUser(data: {
  token: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const { token, name, email, password } = data;

  if (!token || !name?.trim() || !email?.trim() || !password) {
    return { success: false, error: "Please provide your full name, email, and password." };
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { portalToken: token },
    include: { company: true },
  });

  if (!order) {
    return { success: false, error: "Invalid or expired invitation token." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { company: true },
  });

  let userId: string;

  if (existingUser) {
    // 1. RBAC Guard: Client enterprise accounts cannot register as contractors
    if (existingUser.role !== "consultant") {
      return {
        success: false,
        error: "403 Forbidden: This email belongs to an enterprise client account. Please use your contractor specialist email.",
      };
    }

    // 2. Vendor Isolation Guard: Cannot cross between supplier agencies
    if (existingUser.companyId && existingUser.companyId !== order.companyId) {
      return {
        success: false,
        error: `403 Forbidden: Vendor isolation active. This email is registered under ${existingUser.company?.name || "another supplier"}. This link is restricted to ${order.company.name}.`,
      };
    }

    if (existingUser.password !== password) {
      return {
        success: false,
        error: "An account with this email already exists. Please log in with your existing password.",
      };
    }

    userId = existingUser.id;
  } else {
    // Create new specialist account under this supplier company
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: "consultant",
        companyId: order.companyId,
      },
    });
    userId = newUser.id;
  }

  // Ensure assignment to this specific order
  const existingAssignment = await prisma.orderAssignment.findUnique({
    where: {
      purchaseOrderId_userId: {
        purchaseOrderId: order.id,
        userId: userId,
      },
    },
  });

  if (!existingAssignment) {
    await prisma.orderAssignment.create({
      data: {
        purchaseOrderId: order.id,
        userId: userId,
      },
    });
  }

  // Create session
  const sessionData: SessionUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    role: "consultant",
    companyId: order.company.id,
    companyName: order.company.name,
    companyType: "supplier",
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath(`/portal/${token}`);
  return { success: true };
}

/**
 * Logs in an existing external partner specialist
 * Strictly enforces contractor-only role and supplier organization isolation
 */
export async function loginPartnerUser(data: {
  token: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const { token, email, password } = data;

  if (!token || !email?.trim() || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { portalToken: token },
    include: { company: true },
  });

  if (!order) {
    return { success: false, error: "Invalid or expired invitation token." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { company: true },
  });

  if (!user || user.password !== password) {
    return { success: false, error: "Invalid credentials. Please verify your email and password." };
  }

  // 1. RBAC Guard: Client enterprise accounts (Project Lead & Purchasing) CANNOT log into contractor portal
  if (user.role !== "consultant") {
    return {
      success: false,
      error: "403 Forbidden: Client enterprise accounts (Project Lead & Purchasing) cannot log into the external contractor portal. Please use the management cockpit at /login.",
    };
  }

  // 2. Vendor Isolation Guard: Verify the user belongs to this supplier company
  if (user.companyId && user.companyId !== order.companyId) {
    return {
      success: false,
      error: `403 Forbidden: Vendor isolation active. Your account is registered under ${user.company?.name || "another organization"}. This portal link is strictly restricted to ${order.company.name}.`,
    };
  }

  // Ensure assignment to this order
  const existingAssignment = await prisma.orderAssignment.findUnique({
    where: {
      purchaseOrderId_userId: {
        purchaseOrderId: order.id,
        userId: user.id,
      },
    },
  });

  if (!existingAssignment) {
    await prisma.orderAssignment.create({
      data: {
        purchaseOrderId: order.id,
        userId: user.id,
      },
    });
  }

  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: order.company.id,
    companyName: order.company.name,
    companyType: "supplier",
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath(`/portal/${token}`);
  return { success: true };
}

/**
 * Signs out external specialist from the portal
 */
export async function logoutPartnerUser(token: string) {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect(`/portal/${token}`);
}

/**
 * Submits deliverable hours for the authenticated specialist
 */
export async function submitContractorBooking(data: {
  token: string;
  date: string;
  hours: number;
  description: string;
  attachmentUrl?: string;
}) {
  const { token, date, hours, description, attachmentUrl } = data;

  if (!token || !date || !hours || !description?.trim()) {
    return { success: false, error: "Please fill in all deliverable details." };
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { success: false, error: "Authentication required. Please sign in to submit deliverables." };
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { portalToken: token },
    include: {
      company: true,
      bookings: true,
    },
  });

  if (!order) {
    return { success: false, error: "Invalid access token or order not found." };
  }

  // RBAC & Vendor Isolation Guard
  const accessCheck = canAccessContractorPortal(sessionUser.role, sessionUser.companyId, order.companyId);
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error || "403 Forbidden" };
  }

  if (order.status !== "active") {
    return { success: false, error: "This purchase order is closed or not active for time booking." };
  }

  // 1. Domain Validation: German Working Time Act (ArbZG) statutory max 10 hours/day
  const arbzgCheck = validateArbZGWorkingHours(hours, order.maxDailyHours);
  if (!arbzgCheck.valid) {
    return { success: false, error: arbzgCheck.error };
  }

  // 2. Domain Validation: Project timeline validation
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  const projectStartDate = new Date(order.startDate);
  projectStartDate.setHours(0, 0, 0, 0);
  if (startOfDay < projectStartDate) {
    return {
      success: false,
      error: `Booking date (${date}) cannot be before the official project start date (${order.startDate.toISOString().split("T")[0]}).`,
    };
  }

  const existingBookingsOnDate = await prisma.booking.findMany({
    where: {
      userId: sessionUser.id,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { in: ["approved", "submitted"] },
    },
  });

  const existingHoursOnDate = existingBookingsOnDate.reduce((sum: number, b: { hours: number }) => sum + b.hours, 0);
  const cumulativeCheck = validateCumulativeDailyHours(existingHoursOnDate, hours, order.maxDailyHours);
  if (!cumulativeCheck.valid) {
    return { success: false, error: cumulativeCheck.error };
  }

  // 3. Domain Validation: Budget limits
  const consumed = calculateConsumedBudget(order.bookings, order.dailyHoursPerDay);
  const remaining = calculateRemainingBudget(order.totalBudgetDays, consumed);
  const budgetCheck = validateBookingBudget(hours, remaining, order.dailyHoursPerDay);
  if (!budgetCheck.valid) {
    return { success: false, error: budgetCheck.error };
  }

  // 4. Create the booking with status "submitted"
  await prisma.booking.create({
    data: {
      purchaseOrderId: order.id,
      userId: sessionUser.id,
      date: targetDate,
      hours: Number(hours),
      description: description.trim(),
      attachmentUrl: attachmentUrl || null,
      status: "submitted",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/portal/${token}`);

  return { success: true };
}

/**
 * Allows the external contractor to request a budget extension from the Client Lead
 */
export async function requestBudgetExtension(data: {
  token: string;
  requestedHours: number;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  const { token, requestedHours, reason } = data;

  if (!token || !requestedHours || requestedHours <= 0 || !reason?.trim()) {
    return { success: false, error: "Please enter the hours needed and a brief reason." };
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { success: false, error: "Authentication required to request a budget extension." };
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { portalToken: token },
  });

  if (!order) {
    return { success: false, error: "Contract or order not found." };
  }

  // RBAC & Vendor Isolation Guard
  const accessCheck = canAccessContractorPortal(sessionUser.role, sessionUser.companyId, order.companyId);
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error || "403 Forbidden" };
  }

  await prisma.booking.create({
    data: {
      purchaseOrderId: order.id,
      userId: sessionUser.id,
      date: new Date(),
      hours: Number(requestedHours),
      description: `[Budget Extension Request] ${reason.trim()}`,
      status: "extension_requested",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/portal/${token}`);
  return { success: true };
}
