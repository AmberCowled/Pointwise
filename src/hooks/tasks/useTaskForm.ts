"use client";

import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  DEFAULT_TIME_OF_DAY,
} from "@pointwise/app/components/dashboard/tasks/form/constants";
import type {
  RecurringTaskData,
  TaskFormValues,
} from "@pointwise/app/components/dashboard/tasks/form/types";
import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import {
  CORE_TASK_CATEGORIES,
  isCoreTaskCategory,
} from "@pointwise/lib/categories";
import {
  DateTimeDefaults,
  extractTime,
  toLocalDateTimeString,
} from "@pointwise/lib/datetime";
import { useCallback, useEffect, useId, useState } from "react";

export interface UseTaskFormOptions {
  mode?: "create" | "edit";
  task?: DashboardTask | null;
  editScope?: "single" | "series";
  recurringTaskData?: RecurringTaskData | null;
  defaultDate?: Date;
  locale?: string | null;
  timeZone?: string | null;
}

export interface UseTaskFormReturn {
  // Form state
  form: TaskFormValues;
  errors: Record<string, string>;

  // Category state
  selectedCategory: string;
  customCategory: string;

  // Date field state
  hasStart: boolean;
  hasDue: boolean;

  // Conversion confirmation state
  showConvertConfirm: boolean;
  pendingSubmission: TaskFormValues | null;

  // Field IDs
  titleFieldId: string;
  contextFieldId: string;
  categoryFieldId: string;
  customCategoryFieldId: string;
  xpFieldId: string;
  dueFieldId: string;
  startFieldId: string;

  // Form update handlers
  handleChange: <T extends keyof TaskFormValues>(
    key: T,
    value: TaskFormValues[T],
  ) => void;
  handleCategorySelect: (value: string) => void;
  handleCustomCategoryChange: (value: string) => void;

  // Date handlers
  updateStartAt: (value?: string) => void;
  updateDueAt: (value?: string) => void;
  updateStartTime: (value?: string) => void;
  updateDueTime: (value?: string) => void;
  setHasStart: (value: boolean) => void;
  setHasDue: (value: boolean) => void;

  // Recurrence handlers
  toggleWeekday: (index: number) => void;
  addTimeOfDay: () => void;
  updateTimeOfDay: (index: number, value: string) => void;
  removeTimeOfDay: (index: number) => void;

  // Error handlers
  clearError: (key: string) => void;
  clearDateOrderError: () => void;
  setErrors: (errors: Record<string, string>) => void;

  // Conversion handlers
  setShowConvertConfirm: (value: boolean) => void;
  setPendingSubmission: (value: TaskFormValues | null) => void;
}

/**
 * Hook for managing task form state and handlers
 *
 * Handles all form state management including:
 * - Form values initialization
 * - Category selection (core vs custom)
 * - Date field coordination
 * - Recurrence field updates
 * - Error state management
 * - Conversion confirmation state
 */
export function useTaskForm(options: UseTaskFormOptions): UseTaskFormReturn {
  const {
    mode = "create",
    task,
    editScope = "single",
    recurringTaskData,
    locale,
    timeZone,
  } = options;

  const activeTimeZone = timeZone ?? DateTimeDefaults.timeZone;

  const editingTask = mode === "edit" && task ? task : null;

  // When editing a series, use RecurringTask data; otherwise use task data
  const isEditingSeries = mode === "edit" && editScope === "series";
  const sourceData =
    isEditingSeries && recurringTaskData ? recurringTaskData : editingTask;

  // Calculate initial category values
  const initialCategoryValue = sourceData?.category ?? CORE_TASK_CATEGORIES[0];
  const initialCategorySelection = isCoreTaskCategory(initialCategoryValue)
    ? initialCategoryValue
    : CUSTOM_CATEGORY_OPTION_VALUE;

  // Calculate initial date/time values
  const getInitialDateTime = (
    task: DashboardTask | RecurringTaskData | null,
    isRecurringData: boolean,
  ) => {
    if (!task) return { date: undefined, time: undefined };

    if (isRecurringData) {
      // For recurring task data, use the new separate fields
      const taskData = task as RecurringTaskData;
      const startDate = taskData.startDate;
      // startDate is string | null in RecurringTaskData
      const dateStr =
        typeof startDate === "string" ? startDate.split("T")[0] : undefined;
      return {
        date: dateStr,
        time: undefined, // Recurring templates don't have specific times
      };
    } else {
      // For regular tasks, use the new separate fields and ensure they're strings
      const taskData = task as DashboardTask;
      const startDate = taskData.startDate;
      const dateStr =
        startDate instanceof Date
          ? startDate.toISOString().split("T")[0]
          : startDate || undefined;
      return {
        date: dateStr,
        time: taskData.startTime || undefined,
      };
    }

    return { date: undefined, time: undefined };
  };

  const startDateTime =
    isEditingSeries && recurringTaskData
      ? getInitialDateTime(recurringTaskData, true)
      : getInitialDateTime(editingTask, false);

  const dueDateTime = editingTask
    ? {
        date:
          editingTask.dueDate instanceof Date
            ? editingTask.dueDate.toISOString().split("T")[0]
            : editingTask.dueDate || undefined,
        time: editingTask.dueTime || undefined,
      }
    : { date: undefined, time: undefined };

  // Category state
  const [customCategory, setCustomCategory] = useState<string>(() =>
    initialCategorySelection === CUSTOM_CATEGORY_OPTION_VALUE
      ? initialCategoryValue
      : "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySelection,
  );

  // Form state
  const [form, setForm] = useState<TaskFormValues>(() => ({
    id: editingTask?.id,
    title:
      isEditingSeries && recurringTaskData
        ? recurringTaskData.title
        : (editingTask?.title ?? ""),
    category: initialCategoryValue,
    xpValue:
      isEditingSeries && recurringTaskData
        ? recurringTaskData.xpValue
        : (editingTask?.xp ?? 50),
    context:
      isEditingSeries && recurringTaskData
        ? (recurringTaskData.description ?? "")
        : (editingTask?.context ?? ""),
    startDate: startDateTime.date || null,
    startTime: startDateTime.time || null,
    dueDate: dueDateTime.date || null,
    dueTime: dueDateTime.time || null,
    recurrence:
      isEditingSeries && recurringTaskData
        ? recurringTaskData.recurrence
        : "none",
    recurrenceDays:
      isEditingSeries && recurringTaskData
        ? recurringTaskData.recurrenceDays
        : [],
    recurrenceMonthDays:
      isEditingSeries && recurringTaskData
        ? recurringTaskData.recurrenceMonthDays
        : [],
    timesOfDay:
      isEditingSeries && recurringTaskData ? recurringTaskData.timesOfDay : [],
  }));

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Date field visibility state
  const [hasStart, setHasStart] = useState(Boolean(startDateTime.date));
  const [hasDue, setHasDue] = useState(Boolean(dueDateTime.date));

  // Conversion confirmation state
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<TaskFormValues | null>(null);

  // Field IDs
  const titleFieldId = useId();
  const contextFieldId = useId();
  const categoryFieldId = useId();
  const customCategoryFieldId = useId();
  const xpFieldId = useId();
  const dueFieldId = useId();
  const startFieldId = useId();

  // Update form when recurringTaskData loads (for series editing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditingSeries && recurringTaskData) {
      // Extract date from startDate (string | null)
      const recurringStartDate = recurringTaskData.startDate
        ? recurringTaskData.startDate.split("T")[0]
        : undefined;

      setForm((prev) => ({
        ...prev,
        title: recurringTaskData.title,
        category: recurringTaskData.category,
        xpValue: recurringTaskData.xpValue,
        context: recurringTaskData.description ?? "",
        startDate: recurringStartDate || null,
        startTime: null, // Recurring templates don't have specific times
        recurrence: recurringTaskData.recurrence,
        recurrenceDays: recurringTaskData.recurrenceDays,
        recurrenceMonthDays: recurringTaskData.recurrenceMonthDays,
        timesOfDay: recurringTaskData.timesOfDay,
      }));

      setHasStart(Boolean(recurringStartDate));
    }
  }, [isEditingSeries, recurringTaskData, activeTimeZone]);

  // Error handlers
  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearDateOrderError = useCallback(() => {
    clearError("dateOrder");
  }, [clearError]);

  // Date update handlers with coordination
  const updateStartAt = useCallback(
    (value?: string) => {
      const nextStart = value && value.length > 0 ? value : undefined;
      let nextDue: string | undefined;
      setForm((prev) => {
        nextDue = prev.dueDate ?? undefined;
        if (hasDue && nextStart && nextDue && nextStart > nextDue) {
          nextDue = nextStart;
        }
        return { ...prev, startDate: nextStart, dueDate: nextDue };
      });

      clearDateOrderError();
    },
    [clearDateOrderError, hasDue],
  );

  const updateDueAt = useCallback(
    (value?: string) => {
      const nextDue = value && value.length > 0 ? value : undefined;
      let nextStart: string | undefined;
      setForm((prev) => {
        nextStart = prev.startDate ?? undefined;
        if (hasStart && nextStart && nextDue && nextStart > nextDue) {
          nextStart = nextDue;
        }
        return { ...prev, startDate: nextStart, dueDate: nextDue };
      });

      clearDateOrderError();
    },
    [clearDateOrderError, hasStart],
  );

  // Time update handlers
  const updateStartTime = useCallback((value?: string) => {
    setForm((prev) => ({
      ...prev,
      startTime: value && value.length > 0 ? value : null,
    }));
  }, []);

  const updateDueTime = useCallback((value?: string) => {
    setForm((prev) => ({
      ...prev,
      dueTime: value && value.length > 0 ? value : null,
    }));
  }, []);

  // Form field update handlers
  const handleChange = useCallback(
    <T extends keyof TaskFormValues>(key: T, value: TaskFormValues[T]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleCategorySelect = useCallback(
    (value: string) => {
      setSelectedCategory(value);
      clearError("category");
      setForm((prev) => ({
        ...prev,
        category:
          value === CUSTOM_CATEGORY_OPTION_VALUE ? customCategory : value,
      }));
    },
    [customCategory, clearError],
  );

  const handleCustomCategoryChange = useCallback(
    (value: string) => {
      setCustomCategory(value);
      if (selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE) {
        setForm((prev) => ({ ...prev, category: value }));
      }
      clearError("category");
    },
    [selectedCategory, clearError],
  );

  // Recurrence field handlers
  const toggleWeekday = useCallback((index: number) => {
    setForm((prev) => {
      const days = new Set(prev.recurrenceDays ?? []);
      if (days.has(index)) {
        days.delete(index);
      } else {
        days.add(index);
      }
      return { ...prev, recurrenceDays: Array.from(days).sort() };
    });
  }, []);

  const addTimeOfDay = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      timesOfDay: [...(prev.timesOfDay ?? []), DEFAULT_TIME_OF_DAY],
    }));
  }, []);

  const updateTimeOfDay = useCallback((index: number, value: string) => {
    setForm((prev) => {
      const times = [...(prev.timesOfDay ?? [])];
      times[index] = value;
      return { ...prev, timesOfDay: times };
    });
  }, []);

  const removeTimeOfDay = useCallback((index: number) => {
    setForm((prev) => {
      const times = [...(prev.timesOfDay ?? [])];
      times.splice(index, 1);
      return { ...prev, timesOfDay: times };
    });
  }, []);

  return {
    // Form state
    form,
    errors,

    // Category state
    selectedCategory,
    customCategory,

    // Date field state
    hasStart,
    hasDue,

    // Conversion confirmation state
    showConvertConfirm,
    pendingSubmission,

    // Field IDs
    titleFieldId,
    contextFieldId,
    categoryFieldId,
    customCategoryFieldId,
    xpFieldId,
    dueFieldId,
    startFieldId,

    // Form update handlers
    handleChange,
    handleCategorySelect,
    handleCustomCategoryChange,

    // Date handlers
    updateStartAt,
    updateDueAt,
    updateStartTime,
    updateDueTime,
    setHasStart,
    setHasDue,

    // Recurrence handlers
    toggleWeekday,
    addTimeOfDay,
    updateTimeOfDay,
    removeTimeOfDay,

    // Error handlers
    clearError,
    clearDateOrderError,
    setErrors,

    // Conversion handlers
    setShowConvertConfirm,
    setPendingSubmission,
  };
}
