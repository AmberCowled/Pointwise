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

export const DateTimeDefaults = {
  locale: DEFAULT_LOCALE,
  timeZone: DEFAULT_TIME_ZONE,
};
