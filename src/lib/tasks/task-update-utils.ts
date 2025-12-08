/**
 * Task Update Utilities
 * 
 * Helper functions for task updates and field preservation.
 * Centralizes logic for preserving task state during updates and conversions.
 */

import type { UpdateTaskRequest } from '@pointwise/lib/api/types';
import type { RecurrencePattern } from '@pointwise/lib/api/types';

/**
 * Preserved date/time fields from a task
 */
export interface PreservedDateTimeFields {
  startDate: Date | null;
  startTime: string | null;
  dueDate: Date | null;
  dueTime: string | null;
}

/**
 * Task-like object with date/time fields
 */
export interface TaskWithDateTime {
  startDate: Date | null;
  startTime: string | null;
  dueDate: Date | null;
  dueTime: string | null;
}

/**
 * Preserve date/time fields from existing task when not in updates
 * 
 * CRITICAL: This function ensures optional tasks remain optional through conversions.
 * It preserves null values and only applies updates when explicitly provided.
 * 
 * @param task - Existing task with date/time fields
 * @param updates - Update payload that may contain new date/time values
 * @returns Preserved date/time fields (uses existing values if not in updates)
 */
export function preserveDateTimeFields(
  task: TaskWithDateTime,
  updates: UpdateTaskRequest
): PreservedDateTimeFields {
  return {
    startDate: 'startDate' in updates
      ? (updates.startDate ? new Date(updates.startDate) : null)
      : task.startDate,
    startTime: 'startTime' in updates
      ? (updates.startTime ?? null)
      : task.startTime,
    dueDate: 'dueDate' in updates
      ? (updates.dueDate ? new Date(updates.dueDate) : null)
      : task.dueDate,
    dueTime: 'dueTime' in updates
      ? (updates.dueTime ?? null)
      : task.dueTime,
  };
}

/**
 * Build update data object from updates payload
 * Only includes fields that are defined in updates
 */
export function buildUpdateData(updates: UpdateTaskRequest): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.category !== undefined) data.category = updates.category;
  if (updates.xpValue !== undefined) data.xpValue = updates.xpValue;
  if (updates.context !== undefined) data.description = updates.context;
  
  return data;
}

/**
 * Build update data with preserved date/time fields
 */
export function buildUpdateDataWithDateTime(
  updates: UpdateTaskRequest,
  preserved: PreservedDateTimeFields
): Record<string, unknown> {
  return {
    ...buildUpdateData(updates),
    startDate: preserved.startDate,
    startTime: preserved.startTime,
    dueDate: preserved.dueDate,
    dueTime: preserved.dueTime,
  };
}

/**
 * Options for building recurrence pattern
 */
export interface BuildRecurrencePatternOptions {
  type: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  timesOfDay?: string[];
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
}

/**
 * Build recurrence pattern object with defaults
 * 
 * @param options - Pattern configuration options
 * @returns Complete RecurrencePattern object
 */
export function buildRecurrencePattern(
  options: BuildRecurrencePatternOptions
): RecurrencePattern {
  const { type, daysOfWeek, daysOfMonth, timesOfDay, startDate, endDate, maxOccurrences } = options;
  
  // Calculate default maxOccurrences based on type
  const defaultMaxOccurrences = type === 'daily' ? 30 : type === 'weekly' ? 12 : 12;
  
  return {
    type,
    interval: 1, // Always 1 for now (could be parameterized later)
    daysOfWeek: type === 'weekly' ? daysOfWeek : undefined,
    daysOfMonth: type === 'monthly' ? daysOfMonth : undefined,
    timesOfDay: timesOfDay ?? [],
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
    endDate: endDate?.toISOString().split('T')[0],
    maxOccurrences: maxOccurrences ?? defaultMaxOccurrences,
  };
}

/**
 * Clear recurrence fields from a task (for conversion to one-time)
 */
export function clearRecurrenceFields(): Record<string, unknown> {
  return {
    recurrencePattern: null,
    isRecurringInstance: false,
    sourceRecurringTaskId: null,
    recurrenceInstanceKey: null,
    isEditedInstance: false,
    editedInstanceKeys: [],
  };
}

/**
 * Set recurrence fields for a template task
 */
export function setRecurrenceTemplateFields(
  pattern: RecurrencePattern
): Record<string, unknown> {
  return {
    recurrencePattern: pattern as any, // Prisma Json type
    isRecurringInstance: false,
    sourceRecurringTaskId: null,
    recurrenceInstanceKey: null,
    isEditedInstance: false,
    editedInstanceKeys: [],
  };
}

