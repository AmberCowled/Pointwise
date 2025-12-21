/**
 * Date and time filtering utilities for recurrence generation
 */

import { getDateTimeParts, toDateKey } from "@pointwise/lib/datetime";

/**
 * Check if a time is in the future for today
 */
export function isTimeInFuture(
  time: string,
  dayKey: string,
  todayKey: string,
  timeZone: string,
): boolean {
  if (dayKey !== todayKey) return true; // Not today, so it's in the future

  const now = new Date();
  const nowParts = getDateTimeParts(now, timeZone);
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  const nowTimeMinutes = nowParts.hour * 60 + nowParts.minute;
  const occurrenceTimeMinutes = hours * 60 + minutes;

  return occurrenceTimeMinutes >= nowTimeMinutes;
}

/**
 * Filter out past dates (dates before today)
 */
export function filterPastDates(dates: Date[], timeZone: string): Date[] {
  const todayKey = toDateKey(new Date(), timeZone);
  return dates.filter((date) => {
    const dateKey = toDateKey(date, timeZone);
    return dateKey >= todayKey;
  });
}

/**
 * Check if a date should be included (not in the past)
 */
export function isDateInFuture(date: Date, timeZone: string): boolean {
  const todayKey = toDateKey(new Date(), timeZone);
  const dateKey = toDateKey(date, timeZone);
  return dateKey >= todayKey;
}
