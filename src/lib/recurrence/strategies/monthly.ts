/**
 * Monthly recurrence strategy
 */

import {
  startOfDay,
  toDateKey,
  getDateTimeParts,
  mergeDateAndTime,
} from '@pointwise/lib/datetime';
import { isTimeInFuture } from '../filters';
import { RECURRENCE_CONFIG } from '../config';
import type { RecurrenceStrategy } from './base';
import type { RecurrenceConfig, NextOccurrenceInput } from '../types';

export class MonthlyRecurrenceStrategy implements RecurrenceStrategy {
  generateOccurrences(
    config: RecurrenceConfig,
    startDate: Date,
    timeZone: string,
    maxOccurrences: number,
  ): Date[] {
    const occurrences: Date[] = [];
    const base = startOfDay(startDate, timeZone);
    const baseParts = getDateTimeParts(base, timeZone);
    const monthDays =
      config.monthDays && config.monthDays.length > 0
        ? config.monthDays
        : [baseParts.day];

    let occurrenceCount = 0;
    let monthOffset = 0;
    let current = new Date(base);
    const todayKey = toDateKey(new Date(), timeZone);

    while (occurrenceCount < maxOccurrences) {
      const currentParts = getDateTimeParts(current, timeZone);
      const year = currentParts.year;
      const month = currentParts.month;

      for (const day of monthDays) {
        if (occurrenceCount >= maxOccurrences) break;

        // Create date in user's timezone, then convert to UTC Date
        const candidateParts = getDateTimeParts(
          new Date(Date.UTC(year, month - 1, day)),
          timeZone,
        );
        const candidate = new Date(
          Date.UTC(
            candidateParts.year,
            candidateParts.month - 1,
            candidateParts.day,
          ),
        );

        // Skip past dates
        const candidateKey = toDateKey(candidate, timeZone);
        if (candidateKey < todayKey) continue;
        if (candidate < base) continue;

        // Generate tasks for all times on this day
        for (const time of config.timesOfDay) {
          if (occurrenceCount >= maxOccurrences) break;

          // For today, only include future times
          if (!isTimeInFuture(time, candidateKey, todayKey, timeZone)) continue;

          const occurrence = mergeDateAndTime(candidate, time, timeZone);
          occurrences.push(occurrence);
          occurrenceCount++;
        }
      }

      // Move to next month in user's timezone
      monthOffset++;
      const nextMonth = new Date(Date.UTC(year, month, 1));
      current = nextMonth;

      // Safety check to prevent infinite loops
      if (monthOffset > 1000) break;
    }

    return occurrences;
  }

  findNextOccurrence(input: NextOccurrenceInput): Date | null {
    const { baseDate, timeZone, timesOfDay, monthDays, lastTaskDate } = input;
    const base = startOfDay(baseDate, timeZone);
    const baseParts = getDateTimeParts(base, timeZone);
    const targetMonthDays =
      monthDays && monthDays.length > 0 ? monthDays : [baseParts.day];

    let current = new Date(base);
    const todayKey = toDateKey(new Date(), timeZone);
    const maxMonths = RECURRENCE_CONFIG.monthly.maxMonthsToSearch;

    for (
      let monthOffset = lastTaskDate ? 1 : 0;
      monthOffset < maxMonths;
      monthOffset += 1
    ) {
      const currentParts = getDateTimeParts(current, timeZone);
      const year = currentParts.year;
      const month = currentParts.month;

      for (const day of targetMonthDays) {
        const candidateParts = getDateTimeParts(
          new Date(Date.UTC(year, month - 1, day)),
          timeZone,
        );
        const candidate = new Date(
          Date.UTC(
            candidateParts.year,
            candidateParts.month - 1,
            candidateParts.day,
          ),
        );
        const candidateKey = toDateKey(candidate, timeZone);

        // Skip past dates
        if (candidateKey < todayKey) continue;
        if (candidate <= base && lastTaskDate) continue;

        const nextDate = startOfDay(candidate, timeZone);
        // Return the first time of day for that date
        if (timesOfDay.length > 0) {
          return mergeDateAndTime(nextDate, timesOfDay[0], timeZone);
        }
        return nextDate;
      }

      // Move to next month
      current = new Date(Date.UTC(year, month, 1));
    }

    return null;
  }
}
