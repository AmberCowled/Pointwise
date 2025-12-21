/**
 * Tests for recurrence generation
 *
 * This is a high-priority test area because:
 * - Complex date/timezone logic
 * - Many edge cases (DST, leap years, month boundaries)
 * - Critical business functionality
 */

import { describe, expect, it } from "vitest";
import { findNextOccurrence, generateOccurrences } from "./generator";

describe("generateOccurrences", () => {
  describe("daily recurrence", () => {
    it("should generate daily occurrences", () => {
      // Use a future date to avoid past date filtering
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const result = generateOccurrences({
        recurrence: "daily",
        startDate: tomorrow,
        timeZone: "UTC",
        timesOfDay: ["09:00"],
        recurrenceDays: [],
        recurrenceMonthDays: [],
        maxOccurrences: 5,
      });

      expect(result).toHaveLength(5);
      // All dates should be in the future
      result.forEach((date) => {
        expect(date.getTime()).toBeGreaterThan(Date.now());
      });
      // Dates should be consecutive days
      for (let i = 1; i < result.length; i++) {
        const diff = result[i].getTime() - result[i - 1].getTime();
        expect(diff).toBe(24 * 60 * 60 * 1000); // 1 day in milliseconds
      }
    });

    it("should handle multiple times per day", () => {
      // Use a future date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const result = generateOccurrences({
        recurrence: "daily",
        startDate: tomorrow,
        timeZone: "UTC",
        timesOfDay: ["09:00", "14:00", "18:00"],
        recurrenceDays: [],
        recurrenceMonthDays: [],
        maxOccurrences: 6,
      });

      expect(result).toHaveLength(6);
      // Should have 2 days with 3 times each
      // First 3 should be same day, next 3 should be next day
      const firstDay = result[0].toDateString();
      expect(result[1].toDateString()).toBe(firstDay);
      expect(result[2].toDateString()).toBe(firstDay);
      expect(result[3].toDateString()).not.toBe(firstDay);
    });

    it("should respect maxOccurrences limit", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const result = generateOccurrences({
        recurrence: "daily",
        startDate: tomorrow,
        timeZone: "UTC",
        timesOfDay: ["09:00"],
        recurrenceDays: [],
        recurrenceMonthDays: [],
        maxOccurrences: 3,
      });

      expect(result).toHaveLength(3);
    });
  });

  describe("weekly recurrence", () => {
    it("should generate weekly occurrences for specific weekdays", () => {
      // Find next Monday
      const today = new Date();
      const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);

      const result = generateOccurrences({
        recurrence: "weekly",
        startDate: nextMonday,
        timeZone: "UTC",
        timesOfDay: ["09:00"],
        recurrenceDays: [1, 3, 5], // Mon, Wed, Fri
        recurrenceMonthDays: [],
        maxOccurrences: 6,
      });

      expect(result.length).toBeGreaterThan(0);
      // First occurrence should be Monday (1)
      expect(result[0].getDay()).toBe(1);
      // Should include Monday, Wednesday, Friday
      const weekdays = result.map((d) => d.getDay());
      expect(weekdays).toContain(1); // Monday
      expect(weekdays).toContain(3); // Wednesday
      expect(weekdays).toContain(5); // Friday
    });
  });

  describe("edge cases", () => {
    it("should handle invalid recurrence type", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = generateOccurrences({
        recurrence: "invalid" as any,
        startDate: tomorrow,
        timeZone: "UTC",
        timesOfDay: ["09:00"],
        recurrenceDays: [],
        recurrenceMonthDays: [],
        maxOccurrences: 5,
      });

      expect(result).toEqual([]);
    });
  });
});

describe("findNextOccurrence", () => {
  it("should find next daily occurrence", () => {
    // Use a time earlier today or tomorrow
    const baseDate = new Date();
    baseDate.setUTCHours(8, 0, 0, 0);

    const result = findNextOccurrence({
      recurrenceType: "daily",
      baseDate,
      timesOfDay: ["09:00"],
      timeZone: "UTC",
    });

    expect(result).not.toBeNull();
    if (result) {
      // Should be today at 9:00 UTC if before 9am, or tomorrow at 9:00 UTC
      expect(result.getUTCHours()).toBe(9);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getTime()).toBeGreaterThanOrEqual(baseDate.getTime());
    }
  });

  it("should return null for invalid recurrence type", () => {
    const baseDate = new Date();
    const result = findNextOccurrence({
      recurrenceType: "invalid" as any,
      baseDate,
      timesOfDay: ["09:00"],
      timeZone: "UTC",
    });

    expect(result).toBeNull();
  });
});
