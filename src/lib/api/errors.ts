/**
 * Base API error class
 *
 * All API errors extend this class and include:
 * - `status`: HTTP status code (0 for network errors)
 * - `data`: Optional error data from the API response
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Network error (connection issues, timeouts, etc.)
 */
export class NetworkError extends ApiError {
  constructor(
    message: string = "Network error. Please check your connection.",
  ) {
    super(message, 0);
    this.name = "NetworkError";
  }
}

/**
 * Validation error (4xx client errors)
 */
export class ValidationError extends ApiError {
  constructor(message: string, status: number = 400, data?: unknown) {
    super(message, status, data);
    this.name = "ValidationError";
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized. Please sign in.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Server error (5xx)
 */
export class ServerError extends ApiError {
  constructor(
    message: string = "Server error. Please try again later.",
    status: number = 500,
    data?: unknown,
  ) {
    super(message, status, data);
    this.name = "ServerError";
  }
}
