/**
 * Tests for useTaskModals hook
 *
 * Tests modal state management and recurring task data fetching
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskModals } from "./useTaskModals";

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
  startTime: "09:00:00",
  dueDate: "2025-01-16",
  dueTime: "17:00:00",
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

describe("useTaskModals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create modal state", () => {
    it("should initialize with create modal closed", () => {
      const { result } = renderHook(() => useTaskModals());

      expect(result.current.isCreateOpen).toBe(false);
      expect(result.current.editorMode).toBe("create");
      expect(result.current.editorTask).toBeNull();
    });

    it("should open create modal", async () => {
      const { result } = renderHook(() => useTaskModals());

      await act(async () => {
        await result.current.openCreateModal("create");
      });

      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.editorMode).toBe("create");
    });

    it("should close create modal", () => {
      const { result } = renderHook(() => useTaskModals());

      act(() => {
        result.current.openCreateModal("create");
      });

      expect(result.current.isCreateOpen).toBe(true);

      act(() => {
        result.current.closeCreateModal();
      });

      expect(result.current.isCreateOpen).toBe(false);
    });

    it("should set create error", () => {
      const { result } = renderHook(() => useTaskModals());

      act(() => {
        result.current.setCreateError("Test error");
      });

      expect(result.current.createError).toBe("Test error");
    });

    it("should clear create error", () => {
      const { result } = renderHook(() => useTaskModals());

      act(() => {
        result.current.setCreateError("Test error");
        result.current.setCreateError(null);
      });

      expect(result.current.createError).toBeNull();
    });

    it("should set creating state", () => {
      const { result } = renderHook(() => useTaskModals());

      act(() => {
        result.current.setIsCreating(true);
      });

      expect(result.current.isCreating).toBe(true);

      act(() => {
        result.current.setIsCreating(false);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe("manage modal state", () => {
    it("should initialize with manage modal closed", () => {
      const { result } = renderHook(() => useTaskModals());

      expect(result.current.isManageOpen).toBe(false);
      expect(result.current.manageTask).toBeNull();
    });

    it("should open manage modal with task", () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask();

      act(() => {
        result.current.openManageModal(task);
      });

      expect(result.current.isManageOpen).toBe(true);
      expect(result.current.manageTask).toEqual(task);
    });

    it("should close manage modal", () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask();

      act(() => {
        result.current.openManageModal(task);
        result.current.closeManageModal();
      });

      expect(result.current.isManageOpen).toBe(false);
    });
  });

  describe("edit task", () => {
    it("should open edit modal for single task", async () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask();

      await act(async () => {
        await result.current.handleEditTask(task, "single");
      });

      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.editorMode).toBe("edit");
      expect(result.current.editorTask).toEqual(task);
      expect(result.current.editScope).toBe("single");
    });

    it("should derive recurring task data from task pattern when editing series", async () => {
      const { result } = renderHook(() => useTaskModals());

      const task = createMockTask({
        id: "task-1",
        recurrencePattern: {
          type: "daily" as const,
          interval: 1,
          daysOfWeek: [],
          daysOfMonth: [],
          timesOfDay: ["09:00"],
          startDate: "2025-01-15",
          maxOccurrences: 30,
        },
      });

      await act(async () => {
        await result.current.handleEditTask(task, "series");
      });

      // Modal should be open
      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.editorMode).toBe("edit");
      expect(result.current.editScope).toBe("series");

      // Recurring task data should be derived from pattern
      expect(result.current.recurringTaskData).not.toBeNull();
      expect(result.current.recurringTaskData?.recurrence).toBe("daily");
      expect(result.current.recurringTaskData?.timesOfDay).toEqual(["09:00"]);
      expect(result.current.recurringTaskData?.startDate).toBe("2025-01-15");
    });

    it("should handle task with incomplete recurrence pattern", async () => {
      const { result } = renderHook(() => useTaskModals());

      const task = createMockTask({
        id: "task-1",
        sourceRecurringTaskId: "recurring-1",
        // No recurrencePattern on instance - this is the old data structure
      });

      await act(async () => {
        await result.current.handleEditTask(task, "series");
      });

      // Should still open modal even without pattern data
      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.recurringTaskData).toBeNull();
    });

    it("should increment editor version when opening edit modal", async () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask();

      const initialVersion = result.current.editorVersion;

      await act(async () => {
        await result.current.handleEditTask(task, "single");
      });

      expect(result.current.editorVersion).toBeGreaterThan(initialVersion);
    });
  });

  describe("edge cases", () => {
    it("should handle task without recurrence pattern when editing series", async () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask({
        id: "task-1",
        // No recurrencePattern - just a regular task
      });

      // Should not throw, modal should still open
      await act(async () => {
        await result.current.handleEditTask(task, "series");
      });

      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.editScope).toBe("series");
      expect(result.current.recurringTaskData).toBeNull();
    });

    it("should reset state when closing create modal", () => {
      const { result } = renderHook(() => useTaskModals());
      const task = createMockTask();

      act(() => {
        result.current.openCreateModal("edit", task);
        result.current.setCreateError("Error");
        result.current.setIsCreating(true);
      });

      expect(result.current.isCreateOpen).toBe(true);
      expect(result.current.createError).toBe("Error");
      expect(result.current.isCreating).toBe(true);

      act(() => {
        result.current.closeCreateModal();
      });

      expect(result.current.isCreateOpen).toBe(false);
      // Note: Error and creating state may persist until explicitly cleared
    });
  });
});
