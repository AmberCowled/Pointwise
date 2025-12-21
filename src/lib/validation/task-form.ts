/**
 * Client-side validation for task forms
 *
 * This module provides validation utilities that mirror server-side validation
 * in tasks.ts, ensuring consistency between client and server validation rules.
 *
 * Error messages are formatted for display in forms (field-specific errors).
 */

import {
  CONTEXT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@pointwise/app/components/dashboard/tasks/form/constants";
import type { TaskFormValues } from "@pointwise/app/components/dashboard/tasks/form/types";
import {
  isCoreTaskCategory,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from "@pointwise/lib/categories";

export type ValidationErrors = Record<string, string>;

export interface ValidateTaskFormOptions {
  form: TaskFormValues;
  selectedCategory?: string;
  customCategory?: string;
  hasStart?: boolean;
  hasDue?: boolean;
}

export interface ValidationResult {
  errors: ValidationErrors;
  isValid: boolean;
  normalizedValues?: {
    title: string;
    context: string;
    category: string;
    xpValue: number;
  };
}

/**
 * Validates a task form and returns errors and normalized values
 *
 * @param options - Form values and additional context
 * @returns Validation result with errors and normalized values
 */
export function validateTaskForm(
  options: ValidateTaskFormOptions,
): ValidationResult {
  const {
    form,
    selectedCategory,
    customCategory,
    hasStart = false,
    hasDue = false,
  } = options;
  const errors: ValidationErrors = {};

  // Validate title
  const trimmedTitle = form.title.trim();
  if (!trimmedTitle) {
    errors.title = "Title is required";
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`;
  }

  // Validate context
  const trimmedContext = form.context?.trim() ?? "";
  if (trimmedContext.length > CONTEXT_MAX_LENGTH) {
    errors.context = `Context must be ${CONTEXT_MAX_LENGTH} characters or fewer`;
  }

  // Validate XP value
  if (!Number.isFinite(form.xpValue) || form.xpValue < 0) {
    errors.xpValue = "XP must be zero or greater";
  } else if (form.xpValue > 1_000_000) {
    errors.xpValue = "XP must be 1,000,000 or fewer";
  }

  // Validate category
  const rawCategory = form.category ?? "";
  const trimmedCategory = rawCategory.trim();

  // Determine final category based on selection
  const CUSTOM_CATEGORY_OPTION_VALUE = "__custom__";
  const finalCategory =
    selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE
      ? trimmedCategory
      : (selectedCategory ?? trimmedCategory);

  if (selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE) {
    if (!trimmedCategory) {
      errors.category = "Enter a custom category name";
    } else if (trimmedCategory.length > MAX_CUSTOM_CATEGORY_LENGTH) {
      errors.category = `Custom categories must be ${MAX_CUSTOM_CATEGORY_LENGTH} characters or fewer`;
    }
  } else if (!trimmedCategory && !selectedCategory) {
    errors.category = "Choose a category";
  }

  // Validate recurrence fields
  if (form.recurrence === "weekly" && !(form.recurrenceDays?.length ?? 0)) {
    errors.recurrenceDays = "Select at least one weekday";
  }

  if (
    form.recurrence === "monthly" &&
    !(form.recurrenceMonthDays?.length ?? 0)
  ) {
    errors.recurrenceMonthDays = "Choose at least one day of the month";
  }

  // Validate date order
  const startDateTime =
    hasStart && form.startDate && form.startTime
      ? new Date(`${form.startDate}T${form.startTime}`)
      : hasStart && form.startDate
        ? new Date(`${form.startDate}T00:00:00`)
        : null;

  const dueDateTime =
    hasDue && form.dueDate && form.dueTime
      ? new Date(`${form.dueDate}T${form.dueTime}`)
      : hasDue && form.dueDate
        ? new Date(`${form.dueDate}T23:59:59`)
        : null;

  if (
    startDateTime &&
    dueDateTime &&
    startDateTime.getTime() > dueDateTime.getTime()
  ) {
    errors.dateOrder =
      "Start date/time must be before or equal to due date/time";
  }

  const isValid = Object.keys(errors).length === 0;

  // Return normalized values if valid (for use in submission)
  const normalizedValues = isValid
    ? {
        title: trimmedTitle,
        context: trimmedContext,
        category: finalCategory,
        xpValue: form.xpValue,
      }
    : undefined;

  return {
    errors,
    isValid,
    normalizedValues,
  };
}

/**
 * Validates a specific field value
 * Useful for real-time validation as user types
 */
export function validateField(
  field: keyof TaskFormValues,
  value: unknown,
  form?: Partial<TaskFormValues>,
): string | null {
  switch (field) {
    case "title": {
      if (typeof value !== "string") return "Title must be a string";
      const trimmed = value.trim();
      if (!trimmed) return "Title is required";
      if (trimmed.length > TITLE_MAX_LENGTH) {
        return `Title must be ${TITLE_MAX_LENGTH} characters or fewer`;
      }
      return null;
    }

    case "context": {
      if (value === null || value === undefined) return null;
      if (typeof value !== "string") return "Context must be a string";
      const trimmed = value.trim();
      if (trimmed.length > CONTEXT_MAX_LENGTH) {
        return `Context must be ${CONTEXT_MAX_LENGTH} characters or fewer`;
      }
      return null;
    }

    case "xpValue": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return "XP must be a number";
      }
      if (value < 0) return "XP must be zero or greater";
      if (value > 1_000_000) return "XP must be 1,000,000 or fewer";
      return null;
    }

    case "category": {
      if (typeof value !== "string") return "Category must be a string";
      const trimmed = value.trim();
      if (!trimmed) return "Category is required";
      if (
        !isCoreTaskCategory(trimmed) &&
        trimmed.length > MAX_CUSTOM_CATEGORY_LENGTH
      ) {
        return `Custom categories must be ${MAX_CUSTOM_CATEGORY_LENGTH} characters or fewer`;
      }
      return null;
    }

    case "recurrenceDays": {
      if (!form?.recurrence) return null;
      if (form.recurrence === "weekly") {
        if (!Array.isArray(value) || value.length === 0) {
          return "Select at least one weekday";
        }
      }
      return null;
    }

    case "recurrenceMonthDays": {
      if (!form?.recurrence) return null;
      if (form.recurrence === "monthly") {
        if (!Array.isArray(value) || value.length === 0) {
          return "Choose at least one day of the month";
        }
      }
      return null;
    }

    default:
      return null;
  }
}
