'use client';

import { useCallback } from 'react';
import { useNotifications } from '@pointwise/app/components/ui/NotificationProvider';
import { tasksApi } from './endpoints/tasks';
import { userApi } from './endpoints/user';
import { authApi } from './endpoints/auth';
import type { ApiRequestOptions } from './client';

/**
 * Hook to get API client with automatic error notifications
 *
 * @example
 * ```tsx
 * const api = useApi();
 *
 * const task = await api.tasks.create({
 *   title: 'My Task',
 *   category: 'work',
 *   xpValue: 100,
 *   recurrence: 'none',
 * });
 * ```
 */
export function useApi() {
  const { showNotification } = useNotifications();

  // Memoize options creation to avoid recreating on every render
  const createOptions = useCallback(
    (): ApiRequestOptions => ({
      onError: (message, variant = 'error') => {
        showNotification({
          message,
          variant,
        });
      },
    }),
    [showNotification],
  );

  return {
    tasks: {
      create: (
        data: Parameters<typeof tasksApi.create>[0],
        options?: ApiRequestOptions,
      ) => tasksApi.create(data, { ...createOptions(), ...options }),
      update: (
        taskId: string,
        data: Parameters<typeof tasksApi.update>[1],
        scope?: 'single' | 'series',
        options?: ApiRequestOptions,
      ) => tasksApi.update(taskId, data, scope ?? 'single', { ...createOptions(), ...options }),
      delete: (
        taskId: string,
        scope?: 'single' | 'series',
        options?: ApiRequestOptions,
      ) => tasksApi.delete(taskId, scope, { ...createOptions(), ...options }),
      complete: (taskId: string, options?: ApiRequestOptions) =>
        tasksApi.complete(taskId, { ...createOptions(), ...options }),
      getRecurring: (
        taskId: string,
        options?: ApiRequestOptions,
      ) => tasksApi.getRecurring(taskId, { ...createOptions(), ...options }),
    },
    user: {
      updatePreferences: (
        data: Parameters<typeof userApi.updatePreferences>[0],
        options?: ApiRequestOptions,
      ) => userApi.updatePreferences(data, { ...createOptions(), ...options }),
    },
    auth: {
      signup: (
        data: Parameters<typeof authApi.signup>[0],
        options?: ApiRequestOptions,
      ) => authApi.signup(data, { ...createOptions(), ...options }),
    },
  };
}

// Export types
export * from './types';
export * from './errors';

// Export raw API functions (for use outside React components)
export { tasksApi } from './endpoints/tasks';
export { userApi as userApiRaw } from './endpoints/user';
export { authApi as authApiRaw } from './endpoints/auth';
