/**
 * Test fixtures for tasks
 * Reusable test data to avoid duplication
 */

import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';

export const createTestTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => ({
  id: 'test-task-id',
  title: 'Test Task',
  context: 'Test context',
  category: 'Work',
  xp: 50,
  status: 'scheduled',
  completed: false,
  startDate: '2025-01-01',
  startTime: '09:00:00',
  dueDate: '2025-01-01',
  dueTime: '10:00:00',
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

export const createRecurringTask = (overrides: Partial<DashboardTask> = {}): DashboardTask =>
  createTestTask({
    sourceRecurringTaskId: 'recurring-task-id',
    ...overrides,
  });

export const createCompletedTask = (overrides: Partial<DashboardTask> = {}): DashboardTask =>
  createTestTask({
    completed: true,
    status: 'completed',
    completedAt: '2025-01-01T10:00:00.000Z',
    ...overrides,
  });

