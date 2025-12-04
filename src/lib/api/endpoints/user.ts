'use client';

import { apiClient } from '../client';
import type {
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
} from '../types';
import type { ApiRequestOptions } from '../client';

/**
 * User API endpoints
 */
export const userApi = {
  /**
   * Update user preferences (locale, timezone)
   *
   * @returns Promise resolving to updated preferences
   */
  async updatePreferences(
    data: UpdatePreferencesRequest,
    options: ApiRequestOptions = {},
  ): Promise<UpdatePreferencesResponse> {
    return apiClient.post<UpdatePreferencesResponse>(
      '/api/user/preferences',
      data,
      options,
    );
  },
};
