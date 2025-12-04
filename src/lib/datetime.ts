const DEFAULT_LOCALE = 'en-AU';
const DEFAULT_TIME_ZONE = 'UTC';
const MS_IN_DAY = 24 * 60 * 60 * 1000;

type DateInput = Date | string | number | null | undefined;

export type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}::${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return formatterCache.get(key)!;
}

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  return getFormatter('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function getDateTimeParts(date: Date, timeZone: string): DateTimeParts {
  const parts = getPartsFormatter(timeZone).formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  }
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const parts = getDateTimeParts(date, timeZone);
  const utcEquivalent = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return date.getTime() - utcEquivalent;
}

export function toDate(input?: DateInput): Date | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  }
  if (typeof input === 'number') {
    const value = new Date(input);
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const timestamp = Date.parse(trimmed);
    if (Number.isNaN(timestamp)) return null;
    return new Date(timestamp);
  }
  return null;
}

export function startOfDay(
  input: DateInput,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const date = toDate(input) ?? new Date();
  if (!timeZone) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
  const offset = getTimeZoneOffset(date, timeZone);
  const parts = getDateTimeParts(date, timeZone);
  const midnightUtc = Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0);
  return new Date(midnightUtc + offset);
}

export function addDays(
  input: DateInput,
  amount: number,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const base = startOfDay(input, timeZone);
  return new Date(base.getTime() + amount * MS_IN_DAY);
}

export function toDateKey(
  input: DateInput,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input) ?? new Date();
  const parts = getDateTimeParts(date, timeZone);
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
}

export function formatDateLabel(
  input: DateInput,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input) ?? new Date();
  const formatter = getFormatter(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone,
  });
  const parts = formatter.formatToParts(date);

  let weekday = '';
  let month = '';
  let day = '';

  for (const part of parts) {
    switch (part.type) {
      case 'weekday':
        weekday = part.value;
        break;
      case 'month':
        month = part.value;
        break;
      case 'day':
        day = part.value;
        break;
      default:
        break;
    }
  }

  if (!weekday || !month || !day) {
    return formatter.format(date);
  }

  return `${weekday}, ${day} ${month}`;
}

export function formatDateTime(
  input: DateInput,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input) ?? new Date();
  const dateLabel = getFormatter(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date);
  const timeLabel = formatTimePart(date, locale, timeZone);
  return timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel;
}

export function formatTime(
  input: DateInput,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input) ?? new Date();
  return getFormatter(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

export function formatDatePart(
  input: DateInput,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input) ?? new Date();
  return getFormatter(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date);
}

export function formatTimePart(
  input: DateInput,
  _locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  void _locale;
  const date = toDate(input);
  if (!date) return '';
  const parts = getDateTimeParts(date, timeZone);
  const hour24 = parts.hour;
  const minute = String(parts.minute).padStart(2, '0');
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute}${period}`;
}

export function toLocalDateTimeString(
  date: DateInput,
  time: string = '09:00',
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const base = toDate(date) ?? new Date();
  const parts = getDateTimeParts(base, timeZone);
  const [hour = '09', minute = '00'] = time.split(':');
  const hoursNum = Number(hour);
  const minutesNum = Number(minute);

  const targetUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    hoursNum,
    minutesNum,
  );
  const offset = getTimeZoneOffset(new Date(targetUtc), timeZone);
  const zoned = new Date(targetUtc + offset);

  const zonedParts = getDateTimeParts(zoned, timeZone);
  return `${zonedParts.year}-${String(zonedParts.month).padStart(2, '0')}-${String(
    zonedParts.day,
  ).padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export function extractTime(
  input?: DateInput,
  fallback: string = '09:00',
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(input);
  if (!date) return fallback;
  const parts = getDateTimeParts(date, timeZone);
  return `${String(parts.hour).padStart(2, '0')}:${String(
    parts.minute,
  ).padStart(2, '0')}`;
}

export function isSameDay(
  a: DateInput,
  b: DateInput,
  timeZone: string = DEFAULT_TIME_ZONE,
): boolean {
  return toDateKey(a, timeZone) === toDateKey(b, timeZone);
}

/**
 * Merge a date with a specific time in a given timezone
 * Returns a UTC Date that represents the given local time on the given date
 *
 * @param date - The base date (will use its date part, ignoring time)
 * @param time - Time string in format "HH:MM" (24-hour)
 * @param timeZone - IANA timezone string (e.g., "America/New_York")
 * @returns UTC Date representing the local time on the given date
 */
export function mergeDateAndTime(
  date: DateInput,
  time: string,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const baseDate = toDate(date) ?? new Date();
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return new Date(baseDate);
  }

  // Get the target date key (YYYY-MM-DD) in user's timezone
  const targetDateKey = toDateKey(baseDate, timeZone);
  const [targetYear, targetMonth, targetDay] = targetDateKey
    .split('-')
    .map(Number);

  // Use a more direct approach: try different UTC times until we find one that
  // gives us the desired local time. We'll use a binary search-like approach.

  // Start with a reasonable guess: assume timezone offset is between -12 and +14 hours
  // We'll try UTC times around the target time and see which one gives us the right local time

  // First, try creating UTC date at the target time
  let utcDate = new Date(
    Date.UTC(targetYear, targetMonth - 1, targetDay, hours, minutes, 0),
  );

  let userParts = getDateTimeParts(utcDate, timeZone);
  let currentDateKey = toDateKey(utcDate, timeZone);
  let hourDiff = hours - userParts.hour;
  let minuteDiff = minutes - userParts.minute;

  // If date is wrong, we need to adjust significantly
  if (currentDateKey !== targetDateKey) {
    // Date shifted - try adjusting by a full day
    // If currentDateKey > targetDateKey, we're too far ahead, subtract a day
    // If currentDateKey < targetDateKey, we're too far behind, add a day
    const currentKeyNum = parseInt(currentDateKey.replace(/-/g, ''), 10);
    const targetKeyNum = parseInt(targetDateKey.replace(/-/g, ''), 10);
    const dayDiff = currentKeyNum - targetKeyNum;

    if (dayDiff !== 0) {
      // Adjust by the day difference
      utcDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, hours, minutes, 0),
      );
      // Adjust by approximately the timezone offset (try common offsets)
      // For UTC+11 (Sydney), we need to subtract 11 hours from local time to get UTC
      // So if we want 23:00 local, we need 12:00 UTC (23 - 11 = 12)
      // But we don't know the exact offset, so we'll calculate it

      // Get the timezone offset by checking what UTC noon shows as in local time
      const noonUtc = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, 12, 0, 0),
      );
      const noonLocal = getDateTimeParts(noonUtc, timeZone);

      // Calculate UTC time: if UTC noon shows as X local, then to get Y local, we need:
      // UTC = Y - X + 12
      // Example: If UTC noon = 23:00 local (X=23), and we want 23:00 local (Y=23):
      // UTC = 23 - 23 + 12 = 12:00 UTC ✓
      const localTimeAtNoon = noonLocal.hour;
      let utcHour = hours - localTimeAtNoon + 12;
      const utcMinute = minutes;

      // Handle overflow
      while (utcHour < 0) {
        utcHour += 24;
      }
      while (utcHour >= 24) {
        utcHour -= 24;
      }

      utcDate = new Date(
        Date.UTC(targetYear, targetMonth - 1, targetDay, utcHour, utcMinute, 0),
      );
      userParts = getDateTimeParts(utcDate, timeZone);
      currentDateKey = toDateKey(utcDate, timeZone);
      hourDiff = hours - userParts.hour;
      minuteDiff = minutes - userParts.minute;
    }
  }

  // Fine-tune the time if needed (date should be correct now)
  let iterations = 0;
  const maxIterations = 5;

  while (
    currentDateKey === targetDateKey &&
    (hourDiff !== 0 || minuteDiff !== 0) &&
    iterations < maxIterations
  ) {
    const adjustmentMs = (hourDiff * 60 + minuteDiff) * 60 * 1000;
    const newUtcDate = new Date(utcDate.getTime() + adjustmentMs);
    const newUserParts = getDateTimeParts(newUtcDate, timeZone);
    const newDateKey = toDateKey(newUtcDate, timeZone);

    // Only apply if date doesn't change
    if (newDateKey === targetDateKey) {
      utcDate = newUtcDate;
      userParts = newUserParts;
      currentDateKey = newDateKey;
      hourDiff = hours - userParts.hour;
      minuteDiff = minutes - userParts.minute;
    } else {
      // Adjustment would shift date - stop here
      break;
    }

    iterations++;
  }


  return utcDate;
}

export const DateTimeDefaults = {
  locale: DEFAULT_LOCALE,
  timeZone: DEFAULT_TIME_ZONE,
};
