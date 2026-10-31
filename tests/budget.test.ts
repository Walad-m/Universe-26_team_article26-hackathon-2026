import { describe, it, expect } from "vitest";
import {
  calculateConsumedBudget,
  calculateRemainingBudget,
  validateBookingBudget,
  validateArbZGWorkingHours,
  calculateWeeklyBurnRate,
  calculateBudgetForecast,
} from "../app/domain/budget";

describe("Orvix Business Rules & Budget Engine", () => {
  describe("Rule 1: Free Budget Calculation", () => {
    it("calculates consumed budget in Person-Days correctly (8h = 1 PD)", () => {
      const bookings = [
        { hours: 8, status: "approved" },
        { hours: 4, status: "approved" },
        { hours: 8, status: "submitted" },
      ];
      // Total hours: 20 -> 20 / 8 = 2.5 Person-Days
      const consumed = calculateConsumedBudget(bookings, 8.0);
      expect(consumed).toBe(2.5);
    });

    it("calculates remaining budget accurately", () => {
      const totalBudget = 140.0;
      const consumed = 84.0;
      const remaining = calculateRemainingBudget(totalBudget, consumed);
      expect(remaining).toBe(56.0);
    });

    it("accepts a booking that is within the remaining budget", () => {
      const proposedHours = 8.0; // 1.0 PD
      const remainingBudgetDays = 10.0;
      const result = validateBookingBudget(proposedHours, remainingBudgetDays, 8.0);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects a booking that exceeds the remaining free budget", () => {
      const proposedHours = 16.0; // 2.0 PD
      const remainingBudgetDays = 1.0; // only 1.0 PD left
      const result = validateBookingBudget(proposedHours, remainingBudgetDays, 8.0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Booking rejected: only 1 Person-Days remaining");
    });
  });

  describe("Rule 2: German Working Time Act (ArbZG) Compliance", () => {
    it("accepts a compliant working time of 8.0 hours", () => {
      const result = validateArbZGWorkingHours(8.0, 10.0);
      expect(result.valid).toBe(true);
    });

    it("accepts exactly the statutory maximum of 10.0 hours (edge case)", () => {
      const result = validateArbZGWorkingHours(10.0, 10.0);
      expect(result.valid).toBe(true);
    });

    it("rejects a booking exceeding the statutory 10-hour limit", () => {
      const result = validateArbZGWorkingHours(11.5, 10.0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds the German Working Time Act (ArbZG) limit");
    });

    it("rejects 0 or negative hours", () => {
      const result = validateArbZGWorkingHours(0, 10.0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("hours must be greater than 0");
    });
  });

  describe("Rule 3: 4-Week Reorder Radar & Burn Rate Forecast", () => {
    it("calculates weekly burn rate correctly", () => {
      const consumedDays = 84.0;
      const elapsedWeeks = 14;
      const burnRate = calculateWeeklyBurnRate(consumedDays, elapsedWeeks);
      expect(burnRate).toBe(6.0); // 6 PD per week
    });

    it("does not trigger reorder alert when budget lasts more than 4 weeks", () => {
      const remainingDays = 56.0;
      const burnRate = 6.0; // ~9.3 weeks remaining
      const forecast = calculateBudgetForecast(remainingDays, burnRate, 4);

      expect(forecast.weeksRemaining).toBe(9.3);
      expect(forecast.reorderAlertTriggered).toBe(false);
      expect(forecast.status).toBe("safe");
    });

    it("triggers reorder alert when remaining budget is within 4-week purchasing lead time", () => {
      const remainingDays = 18.0;
      const burnRate = 6.0; // 3.0 weeks remaining
      const forecast = calculateBudgetForecast(remainingDays, burnRate, 4);

      expect(forecast.weeksRemaining).toBe(3.0);
      expect(forecast.reorderAlertTriggered).toBe(true);
      expect(forecast.status).toBe("warning");
    });

    it("flags critical status when remaining budget is 2 weeks or less", () => {
      const remainingDays = 6.0;
      const burnRate = 6.0; // 1.0 week remaining
      const forecast = calculateBudgetForecast(remainingDays, burnRate, 4);

      expect(forecast.weeksRemaining).toBe(1.0);
      expect(forecast.reorderAlertTriggered).toBe(true);
      expect(forecast.status).toBe("critical");
    });
  });
});

