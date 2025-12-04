/**
 * Daily recurrence strategy
 */

import {
  startOfDay,
  toDateKey,
  mergeDateAndTime,
} from '@pointwise/lib/datetime';
import { isTimeInFuture } from '../filters';
import { MS_PER_DAY } from '../config';
import type { RecurrenceStrategy } from './base';
import type { RecurrenceConfig, NextOccurrenceInput } from '../types';

export class DailyRecurrenceStrategy implements RecurrenceStrategy {
  generateOccurrences(
    config: RecurrenceConfig,
    startDate: Date,
    timeZone: string,
    maxOccurrences: number,
  ): Date[] {
    const occurrences: Date[] = [];
    const base = startDate; // Already start of day from caller
    const todayKey = toDateKey(new Date(), timeZone);

    let occurrenceCount = 0;
    for (let offset = 0; occurrenceCount < maxOccurrences; offset += 1) {
      const currentDay =
        offset === 0 ? base : new Date(base.getTime() + offset * MS_PER_DAY);
      const dayKey = toDateKey(currentDay, timeZone);

      // Skip all past days
      if (dayKey < todayKey) {
        continue;
      }

      for (const time of config.timesOfDay) {
        if (occurrenceCount >= maxOccurrences) break;

        // For today, only include future times
        if (!isTimeInFuture(time, dayKey, todayKey, timeZone)) continue;

        const occurrence = mergeDateAndTime(currentDay, time, timeZone);
        occurrences.push(occurrence);
        occurrenceCount++;
      }
    }

    return occurrences;
  }

  findNextOccurrence(input: NextOccurrenceInput): Date | null {
    // For daily, maintain 30-day buffer from today
    // Always return the buffer date (30 days from today)
    // The cron job will check if tasks exist and generate missing ones
    const { timeZone, timesOfDay } = input;
    const now = new Date();
    const bufferDate = new Date(now.getTime() + 29 * MS_PER_DAY); // 30th day including today
    const bufferDateStart = startOfDay(bufferDate, timeZone);

    // Return the first time of day for that date
    if (timesOfDay.length > 0) {
      return mergeDateAndTime(bufferDateStart, timesOfDay[0], timeZone);
    }

    return null;
  }
}
