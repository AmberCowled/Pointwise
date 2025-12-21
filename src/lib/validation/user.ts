/**
 * Validation functions for user endpoints
 */

type ValidationError = {
  success: false;
  status: number;
  error: string;
};

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type NormalizedPreferences = {
  locale: string;
  timeZone: string;
};

const MAX_LOCALE_LENGTH = 32;
const MAX_TIMEZONE_LENGTH = 64;

/**
 * Validate user preferences request body
 */
export function parsePreferencesBody(
  input: unknown,
): ValidationSuccess<NormalizedPreferences> | ValidationError {
  if (typeof input !== "object" || input === null) {
    return invalid("Invalid JSON payload.");
  }

  const body = input as Record<string, unknown>;

  const rawLocale =
    typeof body.locale === "string" ? body.locale.trim() : undefined;
  const rawTimeZone =
    typeof body.timeZone === "string" ? body.timeZone.trim() : undefined;

  if (!rawLocale || !rawTimeZone) {
    return invalid("Both locale and timeZone are required.");
  }

  const locale = rawLocale.slice(0, MAX_LOCALE_LENGTH);
  const timeZone = rawTimeZone.slice(0, MAX_TIMEZONE_LENGTH);

  if (locale.length === 0 || timeZone.length === 0) {
    return invalid("Locale and timeZone cannot be empty.");
  }

  return {
    success: true,
    data: {
      locale,
      timeZone,
    },
  };
}

function invalid(error: string, status = 400): ValidationError {
  return { success: false, error, status };
}
