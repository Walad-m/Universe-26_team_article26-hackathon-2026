"use server";

import { prisma } from "@/lib/prisma";
import {
  calculateConsumedBudget,
  calculateRemainingBudget,
  validateArbZGWorkingHours,
  validateBookingBudget,
  validateCumulativeDailyHours,
} from "@/app/domain/budget";
import { revalidatePath } from "next/cache";

export interface BookingSubmissionResult {
  success: boolean;
  error?: string;
  bookingId?: string;
}

/**
 * Loads consultant portal view data for a given user email
 */
export async function getConsultantViewData(userEmail: string = "consultant@supplier-a.de") {
  // 1. Fetch user with company and assignments
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      company: true,
      assignments: {
        include: {
          purchaseOrder: {
            include: {
              bookings: true,
            },
          },
        },
      },
      bookings: {
        include: {
          purchaseOrder: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!user) {
    throw new Error(`User with email "${userEmail}" not found in database.`);
  }

  // 2. Format assigned orders with live remaining budget calculations
  const assignedOrders = user.assignments.map((assignment) => {
    const po = assignment.purchaseOrder;
    const consumedDays = calculateConsumedBudget(po.bookings, po.dailyHoursPerDay);
    const remainingDays = calculateRemainingBudget(po.totalBudgetDays, consumedDays);
    return {
      id: po.id,
      orderNumber: po.orderNumber,
      title: po.title,
      description: po.description,
      totalBudgetDays: po.totalBudgetDays,
      dailyHoursPerDay: po.dailyHoursPerDay,
      maxDailyHours: po.maxDailyHours,
      consumedDays,
      remainingDays,
      status: po.status,
    };
  });

  // 3. Format user's historical bookings
  const bookingsHistory = user.bookings.map((b) => ({
    id: b.id,
    orderId: b.purchaseOrderId,
    orderNumber: b.purchaseOrder.orderNumber,
    orderTitle: b.purchaseOrder.title,
    date: b.date.toISOString().split("T")[0],
    hours: b.hours,
    personDays: Number((b.hours / b.purchaseOrder.dailyHoursPerDay).toFixed(2)),
    description: b.description,
    status: b.status,
    rejectionReason: b.rejectionReason,
    createdAt: b.createdAt.toISOString(),
  }));

  // 4. List all consultant demo users for quick switcher (Juror Demo testing)
  const allConsultants = await prisma.user.findMany({
    where: { role: "consultant" },
    include: { company: true },
    orderBy: { email: "asc" },
  });

  return {
    currentUser: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company?.name ?? "Independent",
    },
    assignedOrders,
    bookingsHistory,
    allConsultants: allConsultants.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company?.name ?? "Independent",
    })),
  };
}

/**
 * Server-side deliverable booking submission
 * Enforces:
 * 1. Statutory ArbZG limit (max 10h per day)
 * 2. Cumulative same-day limit across entries
 * 3. Order status check (active orders only)
 * 4. Free budget availability on the purchase order
 */
export async function submitConsultantBooking(
  userId: string,
  purchaseOrderId: string,
  dateStr: string,
  hours: number,
  description: string
): Promise<BookingSubmissionResult> {
  // Domain Rule 1: Working hours must be valid and within single-entry ArbZG limit
  const arbzgResult = validateArbZGWorkingHours(hours, 10.0);
  if (!arbzgResult.valid) {
    return {
      success: false,
      error: arbzgResult.error ?? "Booking rejected: exceeds statutory working time limits.",
    };
  }

  // Domain Rule 2: Deliverable description required
  if (!description || description.trim().length < 3) {
    return {
      success: false,
      error: "Booking rejected: Please describe the deliverable milestone or work package.",
    };
  }

  // Fetch purchase order with all bookings
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { bookings: true },
  });

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.status !== "active") {
    return { success: false, error: "Order is closed. No new bookings can be submitted." };
  }

  // Domain Rule 3: Cumulative daily check under German ArbZG (§ 3 ArbZG)
  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingBookingsOnDate = await prisma.booking.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ["submitted", "approved"],
      },
    },
  });

  const existingHoursOnDate = existingBookingsOnDate.reduce((sum, b) => sum + b.hours, 0);
  const cumulativeCheck = validateCumulativeDailyHours(
    existingHoursOnDate,
    hours,
    order.maxDailyHours
  );
  if (!cumulativeCheck.valid) {
    return {
      success: false,
      error: `Booking rejected: You already logged ${existingHoursOnDate}h on ${dateStr}. Adding ${hours}h would total ${cumulativeCheck.totalHours}h, violating the German Working Time Act (ArbZG max ${order.maxDailyHours}h/day).`,
    };
  }

  // Domain Rule 4: Remaining budget check
  const consumedDays = calculateConsumedBudget(order.bookings, order.dailyHoursPerDay);
  const remainingDays = calculateRemainingBudget(order.totalBudgetDays, consumedDays);

  const budgetResult = validateBookingBudget(hours, remainingDays, order.dailyHoursPerDay);
  if (!budgetResult.valid) {
    return {
      success: false,
      error: budgetResult.error,
    };
  }

  // All rules passed: persist the booking
  const newBooking = await prisma.booking.create({
    data: {
      userId,
      purchaseOrderId,
      date: targetDate,
      hours,
      description: description.trim(),
      status: "submitted",
    },
  });

  revalidatePath("/consultant");
  revalidatePath("/lead");
  revalidatePath("/purchasing");

  return {
    success: true,
    bookingId: newBooking.id,
  };
}
