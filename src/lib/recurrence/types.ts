/**
 * Recurrence types and shared interfaces
 */

export const RECURRENCE_TYPES = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const RECURRENCE_VALUES = [
  "none",
  "daily",
  "weekly",
  "monthly",
] as const;
export type RecurrenceValue = (typeof RECURRENCE_VALUES)[number];

/**
 * Convert lowercase recurrence value to uppercase type
 */
export function toRecurrenceType(
  value: RecurrenceValue | string,
): RecurrenceType | null {
  if (value === "none") return null;
  const upper = value.toUpperCase();
  return RECURRENCE_TYPES.includes(upper as RecurrenceType)
    ? (upper as RecurrenceType)
    : null;
}

/**
 * Recurrence configuration for a task
 */
export interface RecurrenceConfig {
  type: RecurrenceType;
  timesOfDay: string[];
  daysOfWeek?: number[]; // For weekly (0 = Sunday, 6 = Saturday)
  monthDays?: number[]; // For monthly (1-31)
}

/**
 * Input for generating occurrences
 */
export interface OccurrenceGenerationInput {
  recurrence: RecurrenceValue;
  startDate: Date;
  recurrenceDays: number[];
  recurrenceMonthDays: number[];
  timesOfDay: string[];
  timeZone: string;
  /**
   * Maximum number of occurrences to generate
   * If not provided, uses RECURRENCE_CONFIG.defaultOccurrences (30)
   */
  maxOccurrences?: number;
}

/**
 * Input for finding next occurrence
 */
export interface NextOccurrenceInput {
  recurrenceType: RecurrenceType;
  baseDate: Date;
  timesOfDay: string[];
  timeZone: string;
  daysOfWeek?: number[];
  monthDays?: number[];
  lastTaskDate?: Date; // If provided, find occurrence after this date
}
