/**
 * Main recurrence generator orchestrator
 */

import { toRecurrenceType, type OccurrenceGenerationInput } from './types';
import { RECURRENCE_CONFIG } from './config';
import { DailyRecurrenceStrategy } from './strategies/daily';
import { WeeklyRecurrenceStrategy } from './strategies/weekly';
import { MonthlyRecurrenceStrategy } from './strategies/monthly';
import type { RecurrenceStrategy } from './strategies/base';

/**
 * Get the appropriate strategy for a recurrence type
 */
function getStrategy(recurrenceType: string): RecurrenceStrategy | null {
  const type = toRecurrenceType(recurrenceType);
  if (!type) return null;

  switch (type) {
    case 'DAILY':
      return new DailyRecurrenceStrategy();
    case 'WEEKLY':
      return new WeeklyRecurrenceStrategy();
    case 'MONTHLY':
      return new MonthlyRecurrenceStrategy();
    default:
      return null;
  }
}

/**
 * Generate occurrences for a recurring task
 */
export function generateOccurrences(input: OccurrenceGenerationInput): Date[] {
  const strategy = getStrategy(input.recurrence);
  if (!strategy) return [];

  const recurrenceType = toRecurrenceType(input.recurrence);
  if (!recurrenceType) return [];

  const config = {
    type: recurrenceType,
    timesOfDay: input.timesOfDay,
    daysOfWeek:
      input.recurrenceDays.length > 0 ? input.recurrenceDays : undefined,
    monthDays:
      input.recurrenceMonthDays.length > 0
        ? input.recurrenceMonthDays
        : undefined,
  };

  return strategy.generateOccurrences(
    config,
    input.startDate,
    input.timeZone,
    input.maxOccurrences ?? RECURRENCE_CONFIG.defaultOccurrences,
  );
}

/**
 * Find the next occurrence for a recurring task
 */
export function findNextOccurrence(input: {
  recurrenceType: string;
  baseDate: Date;
  timesOfDay: string[];
  timeZone: string;
  daysOfWeek?: number[];
  monthDays?: number[];
  lastTaskDate?: Date;
}): Date | null {
  const recurrenceType = toRecurrenceType(input.recurrenceType);
  if (!recurrenceType) return null;

  const strategy = getStrategy(input.recurrenceType);
  if (!strategy) return null;

  return strategy.findNextOccurrence({
    recurrenceType,
    baseDate: input.baseDate,
    timesOfDay: input.timesOfDay,
    timeZone: input.timeZone,
    daysOfWeek: input.daysOfWeek,
    monthDays: input.monthDays,
    lastTaskDate: input.lastTaskDate,
  });
}
