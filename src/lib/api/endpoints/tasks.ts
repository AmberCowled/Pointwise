'use client';

import { apiClient } from '../client';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  DeleteTaskResponse,
  CompleteTaskResponse,
} from '../types';
import type { ApiRequestOptions } from '../client';

/**
 * Task API endpoints
 */
export const tasksApi = {
  /**
   * Create a new task (single or recurring)
   */
  async create(
    data: CreateTaskRequest,
    options: ApiRequestOptions = {},
  ): Promise<CreateTaskResponse> {
    return apiClient.post<CreateTaskResponse>('/api/tasks', data, options);
  },

  /**
   * Update an existing task
   */
  async update(
    taskId: string,
    data: UpdateTaskRequest,
    options: ApiRequestOptions = {},
  ): Promise<UpdateTaskResponse> {
    return apiClient.patch<UpdateTaskResponse>(
      `/api/tasks/${taskId}`,
      data,
      options,
    );
  },

  /**
   * Delete a task
   *
   * @param taskId - Task ID to delete
   * @param scope - 'single' to delete one task, 'series' to delete recurring series
   * @returns Promise resolving to deleted task IDs
   */
  async delete(
    taskId: string,
    scope: 'single' | 'series' = 'single',
    options: ApiRequestOptions = {},
  ): Promise<DeleteTaskResponse> {
    const url = `/api/tasks/${taskId}?scope=${scope}`;
    return apiClient.delete<DeleteTaskResponse>(url, options);
  },

  /**
   * Complete a task
   *
   * @returns Promise resolving to updated task and XP snapshot
   */
  async complete(
    taskId: string,
    options: ApiRequestOptions = {},
  ): Promise<CompleteTaskResponse> {
    return apiClient.post<CompleteTaskResponse>(
      `/api/tasks/${taskId}/complete`,
      undefined,
      options,
    );
  },
};
