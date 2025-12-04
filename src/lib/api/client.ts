'use client';

import {
  ApiError,
  NetworkError,
  UnauthorizedError,
  ServerError,
  ValidationError,
} from './errors';
import type { ApiErrorResponse } from './types';

/**
 * Options for API client requests
 */
export interface ApiRequestOptions {
  /**
   * Optional AbortSignal for request cancellation
   */
  signal?: AbortSignal;
  /**
   * Optional callback for error notifications
   * If provided, errors will automatically show notifications
   */
  onError?: (message: string, variant?: 'error' | 'warning' | 'info') => void;
}

/**
 * Base API client class
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Note: Session fetching removed - NextAuth handles authentication automatically
  // via cookies. If we need to check auth status or add custom headers in the future,
  // we can add getSession() back.

  /**
   * Handle error and show notification if callback provided
   *
   * @param error - The API error to handle
   * @param onError - Optional callback to show error notifications
   * @throws Always throws the error after handling
   */
  private handleError(
    error: ApiError,
    onError?: (message: string, variant?: 'error' | 'warning' | 'info') => void,
  ): never {
    // Log error internally (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }

    // Show user-facing notification
    if (onError) {
      let message = error.message;
      let variant: 'error' | 'warning' | 'info' = 'error';

      // Determine user-facing message based on error type
      if (error.status >= 500) {
        // Server error - generic message
        message = 'Something went wrong. Please try again.';
      } else if (error.status === 401) {
        // Unauthorized - redirect handled separately
        message = 'Please sign in to continue.';
        variant = 'warning';
      } else if (error.status >= 400) {
        // Client error - use error message from API
        message = error.message || 'Please check your input.';
      } else if (error instanceof NetworkError) {
        // Network error
        message = 'Unable to connect. Please check your internet connection.';
      }

      onError(message, variant);
    }

    // Handle 401 by redirecting to login
    // Note: Using window.location instead of Next.js router to ensure
    // complete page reload and session cleanup
    if (error.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    throw error;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    apiOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const { signal, onError } = apiOptions;

    try {
      // Build request
      // Note: NextAuth automatically includes session cookies in fetch requests
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Make request
      const response = await fetch(url, {
        ...options,
        headers,
        signal,
      });

      // Parse response
      let data: unknown;
      try {
        const text = await response.text();
        data = text.trim() ? JSON.parse(text) : null;
      } catch (parseError) {
        // Not JSON or empty response
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse API response as JSON:', parseError);
        }
        data = null;
      }

      // Handle errors
      if (!response.ok) {
        // Extract error message from response
        const errorMessage =
          (data && typeof data === 'object' && 'error' in data
            ? String((data as ApiErrorResponse).error)
            : null) || `Request failed with status ${response.status}`;

        if (response.status === 401) {
          const error = new UnauthorizedError(errorMessage);
          return this.handleError(error, onError);
        } else if (response.status >= 500) {
          const error = new ServerError(errorMessage, response.status, data);
          return this.handleError(error, onError);
        } else {
          const error = new ValidationError(
            errorMessage,
            response.status,
            data,
          );
          return this.handleError(error, onError);
        }
      }

      return data as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was cancelled
          throw error;
        }
        // Network error
        const networkError = new NetworkError(error.message);
        return this.handleError(networkError, onError);
      }

      // Unknown error
      const unknownError = new ApiError(
        'An unexpected error occurred',
        0,
        error,
      );
      return this.handleError(unknownError, onError);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, options);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      options,
    );
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      options,
    );
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, options);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
