/**
 * Tests for useAnalyticsSeries hook
 * 
 * Tests analytics snapshot building with memoization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAnalyticsSeries from './useAnalyticsSeries';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';

// Mock analytics functions
vi.mock('@pointwise/lib/analytics', async () => {
  const actual = await vi.importActual('@pointwise/lib/analytics');
  return {
    ...actual,
    buildAnalyticsSnapshot: vi.fn((tasks, range, locale, timeZone) => ({
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: DashboardTask) => t.completed).length,
      range,
      locale,
      timeZone,
    })),
  };
});

const createMockTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => ({
  id: 'task-1',
  title: 'Test Task',
  context: 'Test context',
  category: 'Work',
  xp: 50,
  status: 'scheduled',
  startDate: null,
  dueDate: null,
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

describe('useAnalyticsSeries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build analytics snapshot with tasks', () => {
    const tasks = [
      createMockTask({ id: '1' }),
      createMockTask({ id: '2' }),
    ];

    const { result } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'en-US', 'UTC'),
    );

    expect(result.current).toBeDefined();
    expect(result.current.totalTasks).toBe(2);
  });

  it('should handle empty tasks array', () => {
    const { result } = renderHook(() =>
      useAnalyticsSeries([], '7d', 'en-US', 'UTC'),
    );

    expect(result.current).toBeDefined();
    expect(result.current.totalTasks).toBe(0);
  });

  it('should handle different ranges', () => {
    const tasks = [createMockTask()];

    const { result: result7d } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'en-US', 'UTC'),
    );
    const { result: result30d } = renderHook(() =>
      useAnalyticsSeries(tasks, '30d', 'en-US', 'UTC'),
    );

    expect(result7d.current.range).toBe('7d');
    expect(result30d.current.range).toBe('30d');
  });

  it('should handle different locales', () => {
    const tasks = [createMockTask()];

    const { result: resultEn } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'en-US', 'UTC'),
    );
    const { result: resultFr } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'fr-FR', 'UTC'),
    );

    expect(resultEn.current.locale).toBe('en-US');
    expect(resultFr.current.locale).toBe('fr-FR');
  });

  it('should handle different timezones', () => {
    const tasks = [createMockTask()];

    const { result: resultUtc } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'en-US', 'UTC'),
    );
    const { result: resultEst } = renderHook(() =>
      useAnalyticsSeries(tasks, '7d', 'en-US', 'America/New_York'),
    );

    expect(resultUtc.current.timeZone).toBe('UTC');
    expect(resultEst.current.timeZone).toBe('America/New_York');
  });

  it('should handle non-array tasks input', () => {
    const { result } = renderHook(() =>
      useAnalyticsSeries(null as any, '7d', 'en-US', 'UTC'),
    );

    expect(result.current).toBeDefined();
    expect(result.current.totalTasks).toBe(0);
  });

  it('should memoize results when inputs unchanged', () => {
    const tasks = [createMockTask()];
    const { result, rerender } = renderHook(
      ({ tasks, range, locale, timeZone }) =>
        useAnalyticsSeries(tasks, range, locale, timeZone),
      {
        initialProps: {
          tasks,
          range: '7d' as const,
          locale: 'en-US',
          timeZone: 'UTC',
        },
      },
    );

    const firstResult = result.current;

    rerender({
      tasks,
      range: '7d',
      locale: 'en-US',
      timeZone: 'UTC',
    });

    // Should return same reference if inputs unchanged (memoization)
    expect(result.current).toBe(firstResult);
  });

  it('should recalculate when tasks change', () => {
    const tasks1 = [createMockTask({ id: '1' })];
    const tasks2 = [createMockTask({ id: '1' }), createMockTask({ id: '2' })];

    const { result, rerender } = renderHook(
      ({ tasks }) => useAnalyticsSeries(tasks, '7d', 'en-US', 'UTC'),
      {
        initialProps: { tasks: tasks1 },
      },
    );

    expect(result.current.totalTasks).toBe(1);

    rerender({ tasks: tasks2 });

    expect(result.current.totalTasks).toBe(2);
  });

  it('should recalculate when range changes', () => {
    const tasks = [createMockTask()];
    const { result, rerender } = renderHook(
      ({ range }) => useAnalyticsSeries(tasks, range, 'en-US', 'UTC'),
      {
        initialProps: { range: '7d' as const },
      },
    );

    expect(result.current.range).toBe('7d');

    rerender({ range: '30d' });

    expect(result.current.range).toBe('30d');
  });
});

