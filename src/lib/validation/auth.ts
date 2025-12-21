/**
 * Validation functions for authentication endpoints
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

export type NormalizedSignup = {
  name?: string;
  email: string;
  password: string;
};

/**
 * Validate signup request body
 */
export function parseSignupBody(
  input: unknown,
): ValidationSuccess<NormalizedSignup> | ValidationError {
  if (typeof input !== "object" || input === null) {
    return invalid("Invalid JSON payload.");
  }

  const body = input as Record<string, unknown>;

  const email = getTrimmedString(body.email);
  if (!email) {
    return invalid("Email is required.");
  }
  if (!isValidEmail(email)) {
    return invalid("Invalid email format.");
  }
  if (email.length > 255) {
    return invalid("Email must be 255 characters or fewer.");
  }

  const password =
    typeof body.password === "string" ? body.password : undefined;
  if (!password) {
    return invalid("Password is required.");
  }
  if (password.length < 8) {
    return invalid("Password must be at least 8 characters.");
  }
  if (password.length > 128) {
    return invalid("Password must be 128 characters or fewer.");
  }

  const name = getTrimmedString(body.name);
  if (name && name.length > 100) {
    return invalid("Name must be 100 characters or fewer.");
  }

  return {
    success: true,
    data: {
      name: name || undefined,
      email: email.toLowerCase(),
      password,
    },
  };
}

function getTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function invalid(error: string, status = 400): ValidationError {
  return { success: false, error, status };
}
