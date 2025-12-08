/**
 * Weekly recurrence strategy
 */

import {
  startOfDay,
  toDateKey,
  addDays,
  mergeDateAndTime,
} from '@pointwise/lib/datetime';
import { isTimeInFuture } from '../filters';
import { MS_PER_DAY, DAYS_IN_WEEK, RECURRENCE_CONFIG } from '../config';
import type { RecurrenceStrategy } from './base';
import type { RecurrenceConfig, NextOccurrenceInput } from '../types';

export class WeeklyRecurrenceStrategy implements RecurrenceStrategy {
  generateOccurrences(
    config: RecurrenceConfig,
    startDate: Date,
    timeZone: string,
    maxOccurrences: number,
  ): Date[] {
    const occurrences: Date[] = [];
    const base = startOfDay(startDate, timeZone);
    const daySet = new Set(
      config.daysOfWeek && config.daysOfWeek.length > 0
        ? config.daysOfWeek
        : [base.getDay()],
    );

    let occurrenceCount = 0;
    let weekOffset = 0;
    const todayKey = toDateKey(new Date(), timeZone);

    while (occurrenceCount < maxOccurrences) {
      // Check each day of the week
      for (let dayOffset = 0; dayOffset < DAYS_IN_WEEK; dayOffset += 1) {
        const currentDay = addDays(
          base,
          weekOffset * DAYS_IN_WEEK + dayOffset,
          timeZone,
        );
        const dayKey = toDateKey(currentDay, timeZone);

        // Skip past days
        if (dayKey < todayKey) continue;

        // Check if this day matches the recurrence pattern
        if (!daySet.has(currentDay.getDay())) continue;

        if (config.timesOfDay.length > 0) {
          // Generate tasks for all specified times on this day
          for (const time of config.timesOfDay) {
            if (occurrenceCount >= maxOccurrences) break;

            // For today, only include future times
            if (!isTimeInFuture(time, dayKey, todayKey, timeZone)) continue;

            const occurrence = mergeDateAndTime(currentDay, time, timeZone);
            occurrences.push(occurrence);
            occurrenceCount++;
          }
        } else {
          // No times specified - generate one occurrence per matching day (optional recurring task)
          if (occurrenceCount >= maxOccurrences) break;

          // For today, only include if it's not past
          if (dayKey < todayKey) continue;

          // For optional tasks, use the start of day
          occurrences.push(currentDay);
          occurrenceCount++;
        }

        if (occurrenceCount >= maxOccurrences) break;
      }

      weekOffset++;

      // Safety check to prevent infinite loops
      if (weekOffset > 1000) break;
    }

    return occurrences;
  }

  findNextOccurrence(input: NextOccurrenceInput): Date | null {
    const { baseDate, timeZone, timesOfDay, daysOfWeek, lastTaskDate } = input;
    const base = startOfDay(baseDate, timeZone);
    const daySet = new Set(
      daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [base.getDay()],
    );

    const todayKey = toDateKey(new Date(), timeZone);
    const startOffset = lastTaskDate ? 1 : 0;
    const maxWeeks = RECURRENCE_CONFIG.weekly.maxWeeksToSearch;

    for (
      let offset = startOffset;
      offset < maxWeeks * DAYS_IN_WEEK;
      offset += 1
    ) {
      const candidate = new Date(base.getTime() + offset * MS_PER_DAY);
      const candidateKey = toDateKey(candidate, timeZone);

      // Skip past dates
      if (candidateKey < todayKey) continue;

      if (daySet.has(candidate.getDay())) {
        const nextDate = startOfDay(candidate, timeZone);
        // Return the first time of day for that date
        if (timesOfDay.length > 0) {
          return mergeDateAndTime(nextDate, timesOfDay[0], timeZone);
        }
        return nextDate;
      }
    }

    return null;
  }
}
