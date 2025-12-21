"use client";

import type { ApiRequestOptions } from "../client";
import { apiClient } from "../client";
import type {
  CompleteTaskResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  DeleteTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from "../types";

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
    return apiClient.post<CreateTaskResponse>("/api/tasks", data, options);
  },

  /**
   * Update an existing task
   *
   * @param taskId - Task ID to update
   * @param data - Task update data (including optional recurrence fields)
   * @param scope - 'single' to update one task, 'series' to update entire recurring series
   * @param options - Additional request options
   * @returns Promise resolving to updated task(s)
   */
  async update(
    taskId: string,
    data: UpdateTaskRequest,
    scope: "single" | "series" = "single",
    options: ApiRequestOptions = {},
  ): Promise<UpdateTaskResponse> {
    const url = `/api/tasks/${taskId}?scope=${scope}`;
    return apiClient.patch<UpdateTaskResponse>(url, data, options);
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
    scope: "single" | "series" = "single",
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

  /**
   * Get RecurringTask data for a task (if it's part of a recurring series)
   *
   * @returns Promise resolving to recurring task data or null if not recurring
   */
  async getRecurring(
    taskId: string,
    options: ApiRequestOptions = {},
  ): Promise<{
    isRecurring: boolean;
    recurringTask: {
      id: string;
      title: string;
      description: string | null;
      category: string;
      xpValue: number;
      startAt: string | null;
      recurrence: "daily" | "weekly" | "monthly";
      recurrenceDays: number[];
      recurrenceMonthDays: number[];
      timesOfDay: string[];
    } | null;
  }> {
    return apiClient.get(`/api/tasks/${taskId}/recurring`, options);
  },
};
