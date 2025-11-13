import {
  normalizeTaskCategory,
  normalizeCoreTaskCategory,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from '@pointwise/lib/categories';

const RECURRENCE_VALUES = ['none', 'daily', 'weekly', 'monthly'] as const;
export type RecurrenceValue = (typeof RECURRENCE_VALUES)[number];

export type NormalizedCreateTask = {
  title: string;
  category: string;
  xpValue: number;
  context: string;
  startAt: Date | null;
  dueAt: Date | null;
  recurrence: RecurrenceValue;
  recurrenceDays: number[];
  recurrenceMonthDays: number[];
  timesOfDay: string[];
};

export type NormalizedUpdateTask = {
  title?: string;
  category?: string;
  xpValue?: number;
  context?: string;
  startAt?: Date | null;
  dueAt?: Date | null;
};

type ValidationError = {
  success: false;
  status: number;
  error: string;
};

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export function parseCreateTaskBody(
  input: unknown,
): ValidationSuccess<NormalizedCreateTask> | ValidationError {
  if (typeof input !== 'object' || input === null) {
    return invalid('Invalid JSON payload.');
  }

  const body = input as Record<string, unknown>;

  const title = getTrimmedString(body.title);
  if (!title) {
    return invalid('Title is required.');
  }
  if (title.length > 200) {
    return invalid('Title must be 200 characters or fewer.');
  }

  const context = limitLength(getTrimmedString(body.context) ?? '', 5000);

  const xpValue = sanitizeXpValue(body.xpValue);

  const category = normalizeTaskCategory(getTrimmedString(body.category));
  if (
    category.length > MAX_CUSTOM_CATEGORY_LENGTH &&
    !isCoreCategory(category)
  ) {
    return invalid(
      `Custom categories must be ${MAX_CUSTOM_CATEGORY_LENGTH} characters or fewer.`,
    );
  }

  const startAt = parseNullableDate(body.startAt);
  if (startAt === undefined) {
    return invalid('Invalid startAt value.');
  }

  const dueAt = parseNullableDate(body.dueAt);
  if (dueAt === undefined) {
    return invalid('Invalid dueAt value.');
  }

  if (startAt && dueAt && startAt > dueAt) {
    return invalid('Start date cannot be after due date.');
  }

  const recurrence = parseRecurrence(body.recurrence);
  if (!recurrence) {
    return invalid('Invalid recurrence value.');
  }

  const recurrenceDays = sanitizeIntegerArray(body.recurrenceDays, 0, 6);
  const recurrenceMonthDays = sanitizeIntegerArray(
    body.recurrenceMonthDays,
    1,
    31,
  );
  const timesOfDay = sanitizeTimes(body.timesOfDay);

  if (recurrence === 'weekly' && recurrenceDays.length === 0) {
    return invalid('Select at least one weekday for a weekly recurrence.');
  }

  if (recurrence === 'monthly' && recurrenceMonthDays.length === 0) {
    return invalid(
      'Select at least one day of the month for a monthly recurrence.',
    );
  }

  return {
    success: true,
    data: {
      title,
      category,
      xpValue,
      context,
      startAt,
      dueAt,
      recurrence,
      recurrenceDays,
      recurrenceMonthDays,
      timesOfDay,
    },
  };
}

export function parseUpdateTaskBody(
  input: unknown,
): ValidationSuccess<NormalizedUpdateTask> | ValidationError {
  if (typeof input !== 'object' || input === null) {
    return invalid('Invalid JSON payload.');
  }

  const body = input as Record<string, unknown>;
  const data: NormalizedUpdateTask = {};

  if ('title' in body) {
    const title = getTrimmedString(body.title);
    if (!title) return invalid('Title cannot be empty.');
    if (title.length > 200) {
      return invalid('Title must be 200 characters or fewer.');
    }
    data.title = title;
  }

  if ('category' in body) {
    const category = normalizeTaskCategory(getTrimmedString(body.category));
    if (
      category.length > MAX_CUSTOM_CATEGORY_LENGTH &&
      !isCoreCategory(category)
    ) {
      return invalid(
        `Custom categories must be ${MAX_CUSTOM_CATEGORY_LENGTH} characters or fewer.`,
      );
    }
    data.category = category;
  }

  if ('xpValue' in body) {
    if (typeof body.xpValue !== 'number' || !Number.isFinite(body.xpValue)) {
      return invalid('Invalid xpValue.');
    }
    data.xpValue = sanitizeXpValue(body.xpValue);
  }

  if ('context' in body) {
    const context = limitLength(getTrimmedString(body.context) ?? '', 5000);
    data.context = context;
  }

  if ('startAt' in body) {
    const startAt = parseNullableDate(body.startAt);
    if (startAt === undefined) return invalid('Invalid startAt value.');
    data.startAt = startAt;
  }

  if ('dueAt' in body) {
    const dueAt = parseNullableDate(body.dueAt);
    if (dueAt === undefined) return invalid('Invalid dueAt value.');
    data.dueAt = dueAt;
  }

  if (
    data.startAt instanceof Date &&
    data.dueAt instanceof Date &&
    data.startAt > data.dueAt
  ) {
    return invalid('Start date cannot be after due date.');
  }

  if (Object.keys(data).length === 0) {
    return invalid('No valid fields to update.');
  }

  return { success: true, data };
}

function getTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function sanitizeXpValue(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(1_000_000, Math.round(value)));
  return clamped;
}

function parseNullableDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function parseRecurrence(value: unknown): RecurrenceValue | null {
  if (typeof value !== 'string') return 'none';
  const normalized = value.toLowerCase();
  return RECURRENCE_VALUES.includes(normalized as RecurrenceValue)
    ? (normalized as RecurrenceValue)
    : null;
}

function sanitizeIntegerArray(value: unknown, min: number, max: number) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  for (const entry of value) {
    if (!Number.isInteger(entry)) continue;
    if (entry < min || entry > max) continue;
    seen.add(entry);
  }
  return Array.from(seen).sort((a, b) => a - b);
}

function sanitizeTimes(value: unknown) {
  if (!Array.isArray(value)) return [];
  const times: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (!TIME_REGEX.test(trimmed)) continue;
    times.push(trimmed);
  }
  return Array.from(new Set(times));
}

function limitLength(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function invalid(error: string, status = 400): ValidationError {
  return { success: false, error, status };
}

function isCoreCategory(category: string) {
  return normalizeCoreTaskCategory(category) !== null;
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
