/**
 * Tests for useTaskFilters hook
 *
 * Tests task filtering by date ranges, view modes, and overdue detection
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskFilters } from "./useTaskFilters";

// Mock datetime functions
vi.mock("@pointwise/lib/datetime", async () => {
  const actual = await vi.importActual("@pointwise/lib/datetime");
  return {
    ...actual,
    startOfDay: vi.fn((date: Date, tz?: string) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }),
    addDays: vi.fn((date: Date, days: number, tz?: string) => {
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + days);
      return d;
    }),
    toDate: vi.fn((input?: string | Date | null) => {
      if (!input) return null;
      if (input instanceof Date) return input;
      const parsed = new Date(input);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }),
    toDateKey: vi.fn((date: Date, tz?: string) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }),
    formatDateLabel: vi.fn((date: Date, locale?: string, tz?: string) => {
      return date.toLocaleDateString(locale || "en-AU", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: tz || "UTC",
      });
    }),
    getDateTimeParts: vi.fn((date: Date, tz?: string) => ({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
    })),
  };
});

const createMockTask = (
  overrides: Partial<DashboardTask> = {},
): DashboardTask => ({
  id: "task-1",
  title: "Test Task",
  context: "Test context",
  category: "Work",
  xp: 50,
  status: "scheduled",
  startDate: null,
  startTime: null,
  dueDate: null,
  dueTime: null,
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

describe("useTaskFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const selectedDate = new Date("2025-01-15T12:00:00Z");
  const locale = "en-US";
  const timeZone = "UTC";
  const referenceTimestamp = Date.now();

  describe("scheduledTasks", () => {
    it("should filter tasks for day view", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: "2025-01-15",
          startTime: "09:00:00", // Same day
        }),
        createMockTask({
          id: "2",
          startDate: "2025-01-16",
          startTime: "09:00:00", // Next day
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks.length).toBeGreaterThanOrEqual(1);
      expect(result.current.scheduledTasks.some((t) => t.id === "1")).toBe(
        true,
      );
    });

    it("should filter tasks for week view", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: "2025-01-15",
          startTime: "09:00:00", // Day 1
        }),
        createMockTask({
          id: "2",
          startDate: "2025-01-20",
          startTime: "09:00:00", // Day 6
        }),
        createMockTask({
          id: "3",
          startDate: "2025-01-25",
          startTime: "09:00:00", // Outside week
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "week",
        ),
      );

      expect(result.current.scheduledTasks.length).toBeGreaterThanOrEqual(2);
      expect(result.current.scheduledTasks.some((t) => t.id === "1")).toBe(
        true,
      );
      expect(result.current.scheduledTasks.some((t) => t.id === "2")).toBe(
        true,
      );
    });

    it("should filter tasks for month view", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: "2025-01-15",
          startTime: "09:00:00", // Day 1
        }),
        createMockTask({
          id: "2",
          startDate: "2025-01-30",
          startTime: "09:00:00", // Day 15
        }),
        createMockTask({
          id: "3",
          startDate: "2025-02-10",
          startTime: "09:00:00", // Outside month
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "month",
        ),
      );

      expect(result.current.scheduledTasks.length).toBeGreaterThanOrEqual(2);
      expect(result.current.scheduledTasks.some((t) => t.id === "1")).toBe(
        true,
      );
      expect(result.current.scheduledTasks.some((t) => t.id === "2")).toBe(
        true,
      );
    });

    it("should exclude completed tasks", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: "2025-01-15",
          startTime: "09:00:00",
          completed: false,
        }),
        createMockTask({
          id: "2",
          startDate: "2025-01-15",
          startTime: "10:00:00",
          completed: true,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks.every((t) => !t.completed)).toBe(
        true,
      );
    });

    it("should handle tasks with only dueAt", () => {
      const tasks = [
        createMockTask({
          id: "1",
          dueDate: "2025-01-15",
          dueTime: "17:00:00",
          startDate: null,
          startTime: null,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle tasks that overlap date range", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: "2025-01-14",
          startTime: "09:00:00",
          dueDate: "2025-01-16",
          dueTime: "17:00:00", // Overlaps selected date
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("optionalTasks", () => {
    it("should filter tasks with no dates", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: null,
          startTime: null,
          dueDate: null,
          dueTime: null,
          completed: false,
        }),
        createMockTask({
          id: "2",
          startDate: "2025-01-15",
          startTime: "09:00:00",
          completed: false,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.optionalTasks).toHaveLength(1);
      expect(result.current.optionalTasks[0].id).toBe("1");
    });

    it("should exclude completed tasks", () => {
      const tasks = [
        createMockTask({
          id: "1",
          startDate: null,
          startTime: null,
          dueDate: null,
          dueTime: null,
          completed: false,
        }),
        createMockTask({
          id: "2",
          startDate: null,
          startTime: null,
          dueDate: null,
          dueTime: null,
          completed: true,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.optionalTasks).toHaveLength(1);
      expect(result.current.optionalTasks[0].id).toBe("1");
    });
  });

  describe("overdueTasks", () => {
    it("should filter overdue tasks", () => {
      const tasks = [
        createMockTask({
          id: "1",
          dueDate: "2025-01-14",
          dueTime: "17:00:00",
          completed: false,
        }),
        createMockTask({
          id: "2",
          dueDate: "2025-01-16",
          dueTime: "17:00:00",
          completed: false,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.overdueTasks.length).toBeGreaterThanOrEqual(1);
      expect(result.current.overdueTasks.some((t) => t.id === "1")).toBe(true);
    });

    it("should exclude completed tasks", () => {
      const tasks = [
        createMockTask({
          id: "1",
          dueDate: "2025-01-14",
          dueTime: "17:00:00",
          completed: false,
        }),
        createMockTask({
          id: "2",
          dueDate: "2025-01-14",
          dueTime: "17:00:00",
          completed: true,
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.overdueTasks.every((t) => !t.completed)).toBe(true);
    });

    it("should sort overdue tasks by due date (earliest first)", () => {
      const tasks = [
        createMockTask({
          id: "2",
          dueDate: "2025-01-13",
          dueTime: "17:00:00", // 2 days ago
        }),
        createMockTask({
          id: "1",
          dueDate: "2025-01-14",
          dueTime: "17:00:00", // 1 day ago
        }),
      ];

      const { result } = renderHook(() =>
        useTaskFilters(
          tasks,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      if (result.current.overdueTasks.length >= 2) {
        expect(result.current.overdueTasks[0].id).toBe("2"); // Earlier date first
        expect(result.current.overdueTasks[1].id).toBe("1");
      }
    });
  });

  describe("selectedDateLabel", () => {
    it("should format date label for day view", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          [],
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.selectedDateLabel).toBeDefined();
      expect(typeof result.current.selectedDateLabel).toBe("string");
    });

    it("should format date range for week view", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          [],
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "week",
        ),
      );

      expect(result.current.selectedDateLabel).toBeDefined();
      expect(result.current.selectedDateLabel).toContain("-"); // Range format
    });

    it("should format date range for month view", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          [],
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "month",
        ),
      );

      expect(result.current.selectedDateLabel).toBeDefined();
      expect(result.current.selectedDateLabel).toContain("-"); // Range format
    });
  });

  describe("selectedDateInputValue", () => {
    it("should return date key for selected date", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          [],
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.selectedDateInputValue).toBeDefined();
      expect(typeof result.current.selectedDateInputValue).toBe("string");
      expect(result.current.selectedDateInputValue).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty tasks array", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          [],
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks).toEqual([]);
      expect(result.current.optionalTasks).toEqual([]);
      expect(result.current.overdueTasks).toEqual([]);
    });

    it("should handle non-array tasks input", () => {
      const { result } = renderHook(() =>
        useTaskFilters(
          null as any,
          selectedDate,
          locale,
          timeZone,
          referenceTimestamp,
          "day",
        ),
      );

      expect(result.current.scheduledTasks).toEqual([]);
      expect(result.current.optionalTasks).toEqual([]);
      expect(result.current.overdueTasks).toEqual([]);
    });
  });
});
