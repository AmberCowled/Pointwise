"use client";

import type { ApiRequestOptions } from "./client";
import { apiClient } from "./client";
import type { SignupRequest, SignupResponse } from "./types";

/**
 * Auth API endpoints
 */
export const authApi = {
  /**
   * Sign up a new user
   *
   * @returns Promise resolving to created user data
   */
  async signup(
    data: SignupRequest,
    options: ApiRequestOptions = {},
  ): Promise<SignupResponse> {
    return apiClient.post<SignupResponse>("/api/auth/signup", data, options);
  },
};
