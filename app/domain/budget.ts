/**
 * Orvix Domain Engine: Budget, Pace, Forecast & German Compliance Rules
 */

export interface BookingRecord {
  hours: number;
  status: string;
}

/**
 * Calculates consumed budget in Person-Days
 * Person-Days = Hours / dailyHoursPerDay
 */
export function calculateConsumedBudget(
  bookings: BookingRecord[],
  dailyHoursPerDay: number = 8.0
): number {
  if (dailyHoursPerDay <= 0) {
    throw new Error("dailyHoursPerDay must be greater than 0");
  }

  const validBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "submitted"
  );

  const totalHours = validBookings.reduce((sum, b) => sum + b.hours, 0);
  return Number((totalHours / dailyHoursPerDay).toFixed(2));
}

/**
 * Calculates remaining free budget in Person-Days
 */
export function calculateRemainingBudget(
  totalBudgetDays: number,
  consumedBudgetDays: number
): number {
  return Number(Math.max(0, totalBudgetDays - consumedBudgetDays).toFixed(2));
}

/**
 * Validates whether a proposed booking exceeds the remaining budget
 */
export function validateBookingBudget(
  proposedHours: number,
  remainingBudgetDays: number,
  dailyHoursPerDay: number = 8.0
): { valid: boolean; error?: string } {
  const proposedDays = proposedHours / dailyHoursPerDay;
  if (proposedDays > remainingBudgetDays) {
    return {
      valid: false,
      error: `Booking rejected: only ${remainingBudgetDays} Person-Days remaining on this order.`,
    };
  }
  return { valid: true };
}

/**
 * Validates compliance with German Working Time Act (Arbeitszeitgesetz - ArbZG)
 * Statutory limit: Max 10 hours per day
 */
export function validateArbZGWorkingHours(
  hours: number,
  maxDailyHours: number = 10.0
): { valid: boolean; error?: string } {
  if (hours <= 0) {
    return { valid: false, error: "Booking rejected: hours must be greater than 0." };
  }
  if (hours > maxDailyHours) {
    return {
      valid: false,
      error: `Booking rejected: ${hours} hours exceeds the German Working Time Act (ArbZG) limit of ${maxDailyHours} hours/day.`,
    };
  }
  return { valid: true };
}

/**
 * Validates cumulative daily working hours across multiple bookings for the same date
 * Under § 3 ArbZG, total daily working time across all tasks cannot exceed 10 hours
 */
export function validateCumulativeDailyHours(
  existingHours: number,
  additionalHours: number,
  maxDailyHours: number = 10.0
): { valid: boolean; totalHours: number; error?: string } {
  const totalHours = Number((existingHours + additionalHours).toFixed(2));
  if (totalHours > maxDailyHours) {
    return {
      valid: false,
      totalHours,
      error: `Booking rejected: ${totalHours}h total daily hours exceeds the German Working Time Act (ArbZG) statutory limit of ${maxDailyHours} hours/day.`,
    };
  }
  return { valid: true, totalHours };
}

/**
 * Calculates weekly burn rate (Person-Days consumed per week)
 */
export function calculateWeeklyBurnRate(
  consumedDays: number,
  elapsedWeeks: number
): number {
  if (elapsedWeeks <= 0) return 0;
  return Number((consumedDays / elapsedWeeks).toFixed(2));
}

/**
 * Forecasts the remaining weeks of budget and checks if the 4-week reorder radar is triggered
 */
export function calculateBudgetForecast(
  remainingBudgetDays: number,
  weeklyBurnRate: number,
  reorderLeadWeeks: number = 4
): {
  weeksRemaining: number;
  reorderAlertTriggered: boolean;
  status: "safe" | "warning" | "critical";
} {
  if (weeklyBurnRate <= 0) {
    return {
      weeksRemaining: Infinity,
      reorderAlertTriggered: false,
      status: "safe",
    };
  }

  const weeksRemaining = Number((remainingBudgetDays / weeklyBurnRate).toFixed(1));
  const reorderAlertTriggered = weeksRemaining <= reorderLeadWeeks;

  let status: "safe" | "warning" | "critical" = "safe";
  if (weeksRemaining <= 2) {
    status = "critical";
  } else if (reorderAlertTriggered) {
    status = "warning";
  }

  return {
    weeksRemaining,
    reorderAlertTriggered,
    status,
  };
}

export interface HolidayForecastResult {
  weeklyBurnRate: number;
  burnRateWeeksRemaining: number;
  exhaustionWeek: number;
  exhaustionWeekLabel: string;
  reorderDeadlineWeek: number;
  reorderDeadlineWeekLabel: string;
  missingPersonDays: number;
  reorderAlertTriggered: boolean;
  status: "safe" | "warning" | "critical";
}

/**
 * Calculates budget forecast factoring in German public holidays,
 * year-end Christmas shutdown, and purchasing 4-week lead time.
 * Matches the scenario in docs/challenge.md (140 PD total, 84 used, 6 PD/wk burn).
 */
export function calculateHolidayAdjustedForecast(params: {
  remainingDays: number;
  weeklyBurnRate: number;
  currentCalendarWeek?: number;
  targetProjectWeeks?: number;
  includeChristmasShutdown?: boolean;
  reorderLeadWeeks?: number;
}): HolidayForecastResult {
  const {
    remainingDays,
    weeklyBurnRate,
    currentCalendarWeek = 42,
    targetProjectWeeks = 14.5,
    includeChristmasShutdown = true,
    reorderLeadWeeks = 4,
  } = params;

  if (weeklyBurnRate <= 0) {
    return {
      weeklyBurnRate: 0,
      burnRateWeeksRemaining: Infinity,
      exhaustionWeek: 52,
      exhaustionWeekLabel: "KW 52+",
      reorderDeadlineWeek: 48,
      reorderDeadlineWeekLabel: "KW 48",
      missingPersonDays: 0,
      reorderAlertTriggered: false,
      status: "safe",
    };
  }

  const burnRateWeeksRemaining = Number((remainingDays / weeklyBurnRate).toFixed(1));
  const shutdownBonusWeeks = includeChristmasShutdown ? 1 : 0;
  const exhaustionWeek = Math.round(currentCalendarWeek + Math.floor(burnRateWeeksRemaining) + shutdownBonusWeeks);
  const reorderDeadlineWeek = Math.max(1, exhaustionWeek - reorderLeadWeeks);

  // Missing budget until target project completion (e.g. 14.5 wks * 6 = 87 PD - 56 PD = 31 PD)
  const totalNeededDays = Number((targetProjectWeeks * weeklyBurnRate).toFixed(1));
  const missingPersonDays = Math.max(0, Number((totalNeededDays - remainingDays).toFixed(1)));

  const reorderAlertTriggered = burnRateWeeksRemaining <= reorderLeadWeeks;

  let status: "safe" | "warning" | "critical" = "safe";
  if (burnRateWeeksRemaining <= 2) {
    status = "critical";
  } else if (reorderAlertTriggered) {
    status = "warning";
  }

  return {
    weeklyBurnRate,
    burnRateWeeksRemaining,
    exhaustionWeek,
    exhaustionWeekLabel: `KW ${exhaustionWeek}`,
    reorderDeadlineWeek,
    reorderDeadlineWeekLabel: `KW ${reorderDeadlineWeek}`,
    missingPersonDays,
    reorderAlertTriggered,
    status,
  };
}
