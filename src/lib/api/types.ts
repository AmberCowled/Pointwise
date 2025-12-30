/**
 * Shared API types for client-server communication
 */

// Signup request
export interface SignupRequest {
  name?: string;
  email: string;
  password: string;
}

// Signup response
export interface SignupResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

// API error response (standard format from server)
export interface ApiErrorResponse {
  error: string;
}
