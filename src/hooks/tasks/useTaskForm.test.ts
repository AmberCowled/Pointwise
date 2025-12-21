/**
 * Tests for useTaskForm hook
 *
 * Tests form state management, category selection, date handling, and recurrence
 */

import type { RecurringTaskData } from "@pointwise/app/components/dashboard/tasks/form/types";
import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskForm } from "./useTaskForm";

// Mock datetime functions
vi.mock("@pointwise/lib/datetime", async () => {
  const actual = await vi.importActual("@pointwise/lib/datetime");
  return {
    ...actual,
    DateTimeDefaults: {
      locale: "en-AU",
      timeZone: "UTC",
    },
    extractTime: vi.fn(
      (date: Date, defaultTime: string, _tz: string) => defaultTime,
    ),
    toLocalDateTimeString: vi.fn((date: Date, time: string, _tz: string) => {
      const d = new Date(date);
      const [hours, minutes] = time.split(":");
      d.setUTCHours(Number(hours), Number(minutes), 0, 0);
      return d.toISOString().slice(0, 16); // Return ISO string without seconds
    }),
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
  startDate: "2025-01-15",
  startTime: "09:00",
  dueDate: "2025-01-16",
  dueTime: "17:00",
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

const createMockRecurringTaskData = (
  overrides: Partial<RecurringTaskData> = {},
): RecurringTaskData => ({
  id: "recurring-1",
  title: "Recurring Task",
  description: "Recurring description",
  category: "Work",
  xpValue: 100,
  startDate: "2025-01-15T09:00:00Z",
  recurrence: "daily",
  recurrenceDays: [],
  recurrenceMonthDays: [],
  timesOfDay: ["09:00", "17:00"],
  ...overrides,
});

describe("useTaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values in create mode", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      expect(result.current.form.title).toBe("");
      expect(result.current.form.xpValue).toBe(50);
      expect(result.current.form.recurrence).toBe("none");
      expect(result.current.selectedCategory).toBeDefined();
      expect(result.current.hasStart).toBe(false);
      expect(result.current.hasDue).toBe(false);
    });

    it("should initialize with task values in edit mode", () => {
      const task = createMockTask({
        title: "Existing Task",
        context: "Existing context",
        category: "Personal",
        xp: 75,
      });

      const { result } = renderHook(() =>
        useTaskForm({
          mode: "edit",
          task,
          editScope: "single",
        }),
      );

      expect(result.current.form.title).toBe("Existing Task");
      expect(result.current.form.context).toBe("Existing context");
      expect(result.current.form.xpValue).toBe(75);
      expect(result.current.form.category).toBe("Personal");
    });

    it("should initialize with recurring task data in edit series mode", () => {
      const recurringData = createMockRecurringTaskData({
        title: "Series Task",
        recurrence: "weekly",
        recurrenceDays: [1, 3, 5],
      });

      const { result } = renderHook(() =>
        useTaskForm({
          mode: "edit",
          editScope: "series",
          recurringTaskData: recurringData,
        }),
      );

      expect(result.current.form.title).toBe("Series Task");
      expect(result.current.form.recurrence).toBe("weekly");
      expect(result.current.form.recurrenceDays).toEqual([1, 3, 5]);
    });
  });

  describe("form field updates", () => {
    it("should update title", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("title", "New Title");
      });

      expect(result.current.form.title).toBe("New Title");
    });

    it("should update XP value", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("xpValue", 100);
      });

      expect(result.current.form.xpValue).toBe(100);
    });

    it("should update context", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("context", "New context");
      });

      expect(result.current.form.context).toBe("New context");
    });
  });

  describe("category selection", () => {
    it("should handle core category selection", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleCategorySelect("Work");
      });

      expect(result.current.selectedCategory).toBe("Work");
      expect(result.current.form.category).toBe("Work");
      expect(result.current.customCategory).toBe("");
    });

    it("should handle custom category selection", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleCategorySelect("__custom__");
      });

      expect(result.current.selectedCategory).toBe("__custom__");
    });

    it("should update custom category value", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleCategorySelect("__custom__");
      });

      expect(result.current.selectedCategory).toBe("__custom__");

      act(() => {
        result.current.handleCustomCategoryChange("My Custom Category");
      });

      expect(result.current.customCategory).toBe("My Custom Category");
      // form.category should be updated when custom category is selected
      expect(result.current.form.category).toBe("My Custom Category");
    });
  });

  describe("date field handling", () => {
    it("should toggle start date field", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setHasStart(true);
      });

      expect(result.current.hasStart).toBe(true);
    });

    it("should toggle due date field", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setHasDue(true);
      });

      expect(result.current.hasDue).toBe(true);
    });

    it("should update start date", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setHasStart(true);
        result.current.updateStartAt("2025-01-15");
      });

      expect(result.current.form.startDate).toBe("2025-01-15");
    });

    it("should update due date", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setHasDue(true);
        result.current.updateDueAt("2025-01-16");
      });

      expect(result.current.form.dueDate).toBe("2025-01-16");
    });

    it("should hide start date field when toggled off", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setHasStart(true);
        result.current.updateStartAt("2025-01-15");
      });

      expect(result.current.hasStart).toBe(true);
      expect(result.current.form.startDate).toBeDefined();

      act(() => {
        result.current.setHasStart(false);
      });

      expect(result.current.hasStart).toBe(false);
      // Note: The value may still exist in form state, but the field is hidden
      // This is expected behavior - the field visibility is separate from the value
    });
  });

  describe("recurrence handling", () => {
    it("should update recurrence type", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("recurrence", "daily");
      });

      expect(result.current.form.recurrence).toBe("daily");
    });

    it("should toggle weekday selection", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("recurrence", "weekly");
        result.current.toggleWeekday(1); // Monday
      });

      expect(result.current.form.recurrenceDays).toContain(1);
    });

    it("should add time of day", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("recurrence", "daily");
        result.current.addTimeOfDay();
      });

      expect(result.current.form.timesOfDay).toHaveLength(1);
      expect(result.current.form.timesOfDay?.[0]).toBeDefined();
    });

    it("should update time of day", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("recurrence", "daily");
        result.current.addTimeOfDay();
        result.current.updateTimeOfDay(0, "14:00");
      });

      expect(result.current.form.timesOfDay?.[0]).toBe("14:00");
    });

    it("should remove time of day", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.handleChange("recurrence", "daily");
        result.current.addTimeOfDay();
        result.current.addTimeOfDay();
        result.current.removeTimeOfDay(0);
      });

      expect(result.current.form.timesOfDay).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should set errors", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setErrors({ title: "Title is required" });
      });

      expect(result.current.errors.title).toBe("Title is required");
    });

    it("should clear specific error", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setErrors({
          title: "Title is required",
          xpValue: "Invalid XP",
        });
        result.current.clearError("title");
      });

      expect(result.current.errors.title).toBeUndefined();
      expect(result.current.errors.xpValue).toBe("Invalid XP");
    });

    it("should clear date order error", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setErrors({
          dateOrder: "Start date must be before due date",
        });
        result.current.clearDateOrderError();
      });

      expect(result.current.errors.dateOrder).toBeUndefined();
    });
  });

  describe("conversion confirmation", () => {
    it("should show convert confirmation", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      act(() => {
        result.current.setShowConvertConfirm(true);
      });

      expect(result.current.showConvertConfirm).toBe(true);
    });

    it("should set pending submission", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      const pendingValues: typeof result.current.form = {
        title: "Pending Task",
        category: "Work",
        xpValue: 50,
        context: "",
        recurrence: "none",
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      act(() => {
        result.current.setPendingSubmission(pendingValues);
      });

      expect(result.current.pendingSubmission).toEqual(pendingValues);
    });
  });

  describe("field IDs", () => {
    it("should generate unique field IDs", () => {
      const { result } = renderHook(() => useTaskForm({ mode: "create" }));

      expect(result.current.titleFieldId).toBeDefined();
      expect(result.current.contextFieldId).toBeDefined();
      expect(result.current.categoryFieldId).toBeDefined();
      expect(result.current.xpFieldId).toBeDefined();
      expect(result.current.startFieldId).toBeDefined();
      expect(result.current.dueFieldId).toBeDefined();
    });

    it("should generate different IDs for different instances", () => {
      const { result: result1 } = renderHook(() =>
        useTaskForm({ mode: "create" }),
      );
      const { result: result2 } = renderHook(() =>
        useTaskForm({ mode: "create" }),
      );

      expect(result1.current.titleFieldId).not.toBe(
        result2.current.titleFieldId,
      );
    });
  });
});
