"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "./auth";
import { revalidatePath } from "next/cache";
import {
  calculateConsumedBudget,
  calculateRemainingBudget,
  calculateHolidayAdjustedForecast,
  HolidayForecastResult,
} from "@/app/domain/budget";

export interface BookingDisplayItem {
  id: string;
  orderNumber: string;
  orderTitle: string;
  supplierName: string;
  consultantName: string;
  date: string;
  hours: number;
  personDays: number;
  moneyEur: number;
  description: string;
  status: "submitted" | "approved" | "rejected" | "extension_requested";
  rejectionReason?: string | null;
}

export interface DashboardMetrics {
  totalBudgetDays: number;
  totalBudgetHours: number;
  totalBudgetMoney: number;
  totalBookedDays: number;
  totalBookedHours: number;
  totalBookedMoney: number;
  remainingBudgetDays: number;
  remainingBudgetHours: number;
  remainingBudgetMoney: number;
  missingBudgetHours: number;
  missingBudgetMoney: number;
  activeContractsCount: number;
  externalPartnersCount: number;
  pendingReviewDays: number;
  complianceRate: number;
  forecast: HolidayForecastResult;
  reorderAlert: {
    triggered: boolean;
    orderNumber?: string;
    weeksRemaining?: number;
    message?: string;
  };
}

export async function getDashboardData() {
  const sessionUser = await getSessionUser();

  const orders = await prisma.purchaseOrder.findMany({
    include: {
      company: true,
      bookings: {
        include: {
          user: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let totalBudgetDays = 0;
  let totalBudgetHours = 0;
  let totalBudgetMoney = 0;

  let totalBookedHours = 0;
  let totalBookedMoney = 0;
  let pendingHours = 0;
  const supplierSet = new Set<string>();
  const allBookings: BookingDisplayItem[] = [];

  for (const o of orders) {
    const rate = o.hourlyRate || 100.0;
    const orderHours = Math.round(o.totalBudgetDays * o.dailyHoursPerDay);
    const orderMoney = Math.round(orderHours * rate);

    totalBudgetDays += o.totalBudgetDays;
    totalBudgetHours += orderHours;
    totalBudgetMoney += orderMoney;

    supplierSet.add(o.companyId);

    for (const b of o.bookings) {
      if (b.status === "approved" || b.status === "submitted") {
        totalBookedHours += b.hours;
        totalBookedMoney += Math.round(b.hours * rate);
      }
      if (b.status === "submitted" || b.status === "extension_requested") {
        pendingHours += b.hours;
      }

      allBookings.push({
        id: b.id,
        orderNumber: o.orderNumber,
        orderTitle: o.title,
        supplierName: o.company.name,
        consultantName: b.user?.name || "Contractor Specialist",
        date: b.date.toISOString().split("T")[0],
        hours: b.hours,
        personDays: Number((b.hours / o.dailyHoursPerDay).toFixed(2)),
        moneyEur: Number((b.hours * rate).toFixed(0)),
        description: b.description,
        status: b.status as "submitted" | "approved" | "rejected" | "extension_requested",
        rejectionReason: b.rejectionReason,
      });
    }
  }

  const totalBookedDays = Number((totalBookedHours / 8.0).toFixed(1));
  const remainingBudgetDays = Number(Math.max(0, totalBudgetDays - totalBookedDays).toFixed(1));
  const remainingBudgetHours = Math.max(0, totalBudgetHours - totalBookedHours);
  const remainingBudgetMoney = Math.max(0, totalBudgetMoney - totalBookedMoney);

  const pendingReviewDays = Number((pendingHours / 8.0).toFixed(1));

  // Run Holiday & Christmas Shutdown Pace Forecaster
  // If the primary order has bookings, forecast based on remaining vs project finish line
  const primaryOrder = orders[0];
  const primaryRate = primaryOrder?.hourlyRate || 100.0;
  const primaryConsumed = primaryOrder
    ? calculateConsumedBudget(primaryOrder.bookings, primaryOrder.dailyHoursPerDay)
    : 8.0;
  const primaryRemaining = primaryOrder
    ? calculateRemainingBudget(primaryOrder.totalBudgetDays, primaryConsumed)
    : remainingBudgetDays;

  const forecast = calculateHolidayAdjustedForecast({
    remainingDays: primaryRemaining,
    weeklyBurnRate: 6.0,
    currentCalendarWeek: 42,
    targetProjectWeeks: 14.5,
    includeChristmasShutdown: true,
    reorderLeadWeeks: 4,
  });

  const missingBudgetHours = Math.round(forecast.missingPersonDays * (primaryOrder?.dailyHoursPerDay || 8.0));
  const missingBudgetMoney = Math.round(missingBudgetHours * primaryRate);

  const hasShortfall = forecast.missingPersonDays > 0;

  const reorderAlert = {
    triggered: hasShortfall && forecast.reorderAlertTriggered,
    orderNumber: primaryOrder ? primaryOrder.orderNumber : "PO-4500012345",
    weeksRemaining: forecast.burnRateWeeksRemaining,
    message: hasShortfall
      ? `4-Week Early Warning: Budget will be short by ${forecast.missingPersonDays} Days (€${missingBudgetMoney.toLocaleString()}) before the February 2027 project deadline. Purchasing lead time triggered.`
      : `Budget runway is healthy. All planned milestones covered with ${primaryRemaining} Days remaining.`,
  };

  const metrics: DashboardMetrics = {
    totalBudgetDays: Number(totalBudgetDays.toFixed(1)),
    totalBudgetHours,
    totalBudgetMoney,
    totalBookedDays,
    totalBookedHours,
    totalBookedMoney,
    remainingBudgetDays,
    remainingBudgetHours,
    remainingBudgetMoney,
    missingBudgetHours,
    missingBudgetMoney,
    activeContractsCount: orders.length,
    externalPartnersCount: supplierSet.size,
    pendingReviewDays,
    complianceRate: 100,
    forecast,
    reorderAlert,
  };

  return {
    currentUser: sessionUser || {
      name: "Klaus Schmidt",
      email: "lead@client.de",
      role: "project_lead",
      companyName: "Deutsche Enterprise AG",
      companyType: "client",
    },
    metrics,
    orders: orders.map((o) => {
      const rate = o.hourlyRate || 100.0;
      const consumed = calculateConsumedBudget(o.bookings, o.dailyHoursPerDay);
      const remaining = calculateRemainingBudget(o.totalBudgetDays, consumed);
      const totalHours = Math.round(o.totalBudgetDays * o.dailyHoursPerDay);
      const totalMoney = Math.round(totalHours * rate);
      const usedHours = Math.round(consumed * o.dailyHoursPerDay);
      const usedMoney = Math.round(usedHours * rate);
      const leftHours = Math.round(remaining * o.dailyHoursPerDay);
      const leftMoney = Math.round(leftHours * rate);

      // Individual project forecast
      const orderBurnRate = consumed > 0 ? 6.0 : 0.0;
      const orderForecast = calculateHolidayAdjustedForecast({
        remainingDays: remaining,
        weeklyBurnRate: orderBurnRate > 0 ? orderBurnRate : 5.0,
        currentCalendarWeek: 42,
        targetProjectWeeks: 14.5,
        includeChristmasShutdown: true,
        reorderLeadWeeks: o.reorderLeadWeeks || 4,
      });

      const orderMissingDays = consumed > 0 ? orderForecast.missingPersonDays : 0;
      const orderMissingHours = Math.round(orderMissingDays * o.dailyHoursPerDay);
      const orderMissingMoney = Math.round(orderMissingHours * rate);
      const hasShortfall = orderMissingDays > 0;

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        title: o.title,
        description: o.description,
        totalBudgetDays: o.totalBudgetDays,
        hourlyRate: rate,
        totalHours,
        totalMoney,
        bookedDays: consumed,
        usedHours,
        usedMoney,
        remainingDays: remaining,
        leftHours,
        leftMoney,
        startDate: o.startDate.toISOString().split("T")[0],
        endDate: o.endDate.toISOString().split("T")[0],
        portalToken: o.portalToken || o.id,
        supplierName: o.company.name,
        status: o.status,
        forecast: {
          ...orderForecast,
          missingPersonDays: orderMissingDays,
        },
        hasShortfall,
        missingBudgetHours: orderMissingHours,
        missingBudgetMoney: orderMissingMoney,
      };
    }),
    bookings: allBookings,
  };
}

export async function createOrderAndGenerateLink(data: {
  externalCompanyName: string;
  projectName: string;
  orderNumber: string;
  budgetDays: number;
  hourlyRate?: number;
  startDate: string;
  endDate: string;
}) {
  const { externalCompanyName, projectName, orderNumber, budgetDays, hourlyRate = 100.0, startDate, endDate } = data;

  if (!externalCompanyName || !projectName || !orderNumber || !budgetDays) {
    return { success: false, error: "Please fill in all project and budget details." };
  }

  let supplier = await prisma.company.findFirst({
    where: { name: externalCompanyName.trim() },
  });

  if (!supplier) {
    supplier = await prisma.company.create({
      data: {
        name: externalCompanyName.trim(),
        type: "supplier",
      },
    });
  }

  const generatedToken = "partner-" + Math.random().toString(36).substring(2, 10);

  const order = await prisma.purchaseOrder.create({
    data: {
      orderNumber: orderNumber.trim(),
      portalToken: generatedToken,
      title: projectName.trim(),
      totalBudgetDays: Number(budgetDays),
      hourlyRate: Number(hourlyRate || 100.0),
      startDate: new Date(startDate || new Date()),
      endDate: new Date(endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      status: "active",
      companyId: supplier.id,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    generatedToken,
    orderId: order.id,
  };
}

export async function approveBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { purchaseOrder: true },
    });

    if (!booking) return { success: false, error: "Booking not found" };

    // If this was an extension request from contractor, add the hours to the purchase order budget!
    if (booking.status === "extension_requested") {
      const additionalDays = Number((booking.hours / booking.purchaseOrder.dailyHoursPerDay).toFixed(1));
      await prisma.purchaseOrder.update({
        where: { id: booking.purchaseOrderId },
        data: {
          totalBudgetDays: booking.purchaseOrder.totalBudgetDays + additionalDays,
        },
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "approved", rejectionReason: null },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to approve booking";
    return { success: false, error: message };
  }
}

export async function rejectBooking(bookingId: string, reason: string = "Exceeds agreed daily deliverable scope") {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "rejected", rejectionReason: reason },
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reject booking";
    return { success: false, error: message };
  }
}

export async function createReorderProposal(orderId?: string, missingDays: number = 31.0) {
  try {
    const primaryOrder = orderId
      ? await prisma.purchaseOrder.findUnique({ where: { id: orderId } })
      : await prisma.purchaseOrder.findFirst({ where: { status: "active" } });

    if (!primaryOrder) {
      return { success: false, error: "No active order found to extend." };
    }

    const extOrderNumber = `${primaryOrder.orderNumber}-EXT`;
    const existing = await prisma.purchaseOrder.findUnique({
      where: { orderNumber: extOrderNumber },
    });

    if (existing) {
      return {
        success: true,
        message: `Proposal ${extOrderNumber} is already in the procurement queue.`,
      };
    }

    await prisma.purchaseOrder.create({
      data: {
        orderNumber: extOrderNumber,
        portalToken: "ext-" + Math.random().toString(36).substring(2, 9),
        title: `${primaryOrder.title} · Extension (${missingDays} Days)`,
        totalBudgetDays: missingDays,
        hourlyRate: primaryOrder.hourlyRate,
        startDate: primaryOrder.endDate,
        endDate: new Date(new Date(primaryOrder.endDate).getTime() + 60 * 24 * 60 * 60 * 1000),
        status: "reorder_draft",
        companyId: primaryOrder.companyId,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Follow-up purchase requisition ${extOrderNumber} for ${missingDays} Days created and forwarded to Purchasing!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create reorder proposal";
    return { success: false, error: message };
  }
}
