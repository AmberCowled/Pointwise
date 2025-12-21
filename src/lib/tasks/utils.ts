/**
 * Task Type Utilities
 *
 * Helper functions for identifying task types and states.
 * Centralizes task type checking logic for consistency.
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import type { Task } from "@pointwise/lib/api/types";

/**
 * Check if a task is a recurring template (not an instance)
 * Template tasks have recurrencePattern and are NOT instances
 */
export function isTaskTemplate(
  task: Pick<Task | DashboardTask, "isRecurringInstance" | "recurrencePattern">,
): boolean {
  return (
    !task.isRecurringInstance &&
    task.recurrencePattern !== undefined &&
    task.recurrencePattern !== null
  );
}

/**
 * Check if a task is a recurring instance (generated from template)
 * Instance tasks have sourceRecurringTaskId and are marked as instances
 */
export function isTaskInstance(
  task: Pick<
    Task | DashboardTask,
    "isRecurringInstance" | "sourceRecurringTaskId"
  >,
): boolean {
  return Boolean(task.isRecurringInstance && task.sourceRecurringTaskId);
}

/**
 * Check if a task is a one-time task (not recurring)
 * One-time tasks have no recurrence pattern and are not instances
 */
export function isOneTimeTask(
  task: Pick<
    Task | DashboardTask,
    "isRecurringInstance" | "recurrencePattern" | "sourceRecurringTaskId"
  >,
): boolean {
  return (
    !task.isRecurringInstance &&
    !task.recurrencePattern &&
    !task.sourceRecurringTaskId
  );
}

/**
 * Check if a task is an edited instance
 */
export function isEditedInstance(
  task: Pick<Task | DashboardTask, "isEditedInstance">,
): boolean {
  return Boolean(task.isEditedInstance);
}

/**
 * Check if a task is optional (no date/time)
 */
export function isOptionalTask(
  task: Pick<
    Task | DashboardTask,
    "startDate" | "startTime" | "dueDate" | "dueTime"
  >,
): boolean {
  return !task.startDate && !task.startTime && !task.dueDate && !task.dueTime;
}

/**
 * Check if a task has date but no time (date-only)
 */
export function isDateOnlyTask(
  task: Pick<Task | DashboardTask, "startDate" | "startTime">,
): boolean {
  return Boolean(task.startDate && !task.startTime);
}

/**
 * Get task type as a string (for debugging/logging)
 */
export function getTaskType(task: Task | DashboardTask): string {
  if (isTaskTemplate(task)) return "template";
  if (isTaskInstance(task)) return "instance";
  if (isOneTimeTask(task)) return "one-time";
  return "unknown";
}
