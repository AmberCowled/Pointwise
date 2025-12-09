/**
 * Tests for useTaskOperations hook
 * 
 * Tests task CRUD operations, state updates, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskOperations } from './useTaskOperations';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import type { TaskFormValues } from '@pointwise/app/components/dashboard/tasks/form/types';

const createMockTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => ({
  id: 'task-1',
  title: 'Test Task',
  context: 'Test context',
  category: 'Work',
  xp: 50,
  status: 'scheduled',
  startDate: '2025-01-15',
  startTime: '09:00:00',
  dueDate: '2025-01-16',
  dueTime: '17:00:00',
  completedAt: null,
  sourceRecurringTaskId: null,
  ...overrides,
});

describe('useTaskOperations', () => {
  const mockSetTaskItems = vi.fn();
  const mockCloseCreateModal = vi.fn();
  const mockCloseManageModal = vi.fn();
  const mockSetCreateError = vi.fn();
  const mockSetIsCreating = vi.fn();
  const mockUpdateXpFromSnapshot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleSubmitTask - create mode', () => {
    it('should create a task successfully', async () => {
      const mockCreateTask = vi.fn().mockResolvedValue({
        tasks: [createMockTask({ id: 'new-task-1', title: 'New Task' })],
      });

      const mockUpdateTask = vi.fn();
      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          closeCreateModal: mockCloseCreateModal,
          setIsCreating: mockSetIsCreating,
          editorMode: 'create',
        }),
      );

      const formValues: TaskFormValues = {
        title: 'New Task',
        category: 'Work',
        xpValue: 50,
        context: 'New context',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
        // Wait for setTimeout to complete
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        category: 'Work',
        xpValue: 50,
        context: 'New context',
        startDate: null,
        startTime: null,
        dueDate: null,
        dueTime: null,
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      });
      expect(mockSetTaskItems).toHaveBeenCalled();
      expect(mockCloseCreateModal).toHaveBeenCalled();
    });

    it('should handle create task with dates', async () => {
      const mockCreateTask = vi.fn().mockResolvedValue({
        tasks: [createMockTask()],
      });

      const mockUpdateTask = vi.fn();
      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          closeCreateModal: mockCloseCreateModal,
          setIsCreating: mockSetIsCreating,
          editorMode: 'create',
        }),
      );

      const formValues: TaskFormValues = {
        title: 'Task with dates',
        category: 'Work',
        xpValue: 50,
        context: '',
        startDate: '2025-01-15',
        startTime: '09:00:00',
        dueDate: '2025-01-16',
        dueTime: '17:00:00',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          startTime: expect.any(String),
          dueDate: expect.any(String),
          dueTime: expect.any(String),
        }),
      );
    });

    it('should handle create task error', async () => {
      const mockCreateTask = vi.fn().mockRejectedValue(new Error('Create failed'));
      const mockUpdateTask = vi.fn();

      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          setCreateError: mockSetCreateError,
          setIsCreating: mockSetIsCreating,
          editorMode: 'create',
        }),
      );

      const formValues: TaskFormValues = {
        title: 'New Task',
        category: 'Work',
        xpValue: 50,
        context: '',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      // Error message may be 'Create failed' or 'Failed to create task' (fallback)
      expect(mockSetCreateError).toHaveBeenCalled();
      const errorCalls = mockSetCreateError.mock.calls;
      const hasErrorCall = errorCalls.some(
        (call) => call[0] === 'Create failed' || call[0] === 'Failed to create task',
      );
      expect(hasErrorCall).toBe(true);
      expect(mockSetIsCreating).toHaveBeenCalledWith(false);
    });
  });

  describe('handleSubmitTask - edit mode', () => {
    it('should update a single task successfully', async () => {
      const mockUpdateTask = vi.fn().mockResolvedValue({
        task: createMockTask({ id: 'task-1', title: 'Updated Task' }),
      });

      const mockCreateTask = vi.fn();
      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          closeCreateModal: mockCloseCreateModal,
          setIsCreating: mockSetIsCreating,
          editorMode: 'edit',
          editScope: 'single',
        }),
      );

      const formValues: TaskFormValues = {
        id: 'task-1',
        title: 'Updated Task',
        category: 'Work',
        xpValue: 75,
        context: 'Updated context',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          title: 'Updated Task',
          xpValue: 75,
        }),
        'single',
      );
      expect(mockSetTaskItems).toHaveBeenCalled();
    });

    it('should update a series with recurrence fields', async () => {
      const mockUpdateTask = vi.fn().mockResolvedValue({
        tasks: [createMockTask({ id: 'task-1' }), createMockTask({ id: 'task-2' })],
      });

      const mockCreateTask = vi.fn();
      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          closeCreateModal: mockCloseCreateModal,
          setIsCreating: mockSetIsCreating,
          editorMode: 'edit',
          editScope: 'series',
        }),
      );

      const formValues: TaskFormValues = {
        id: 'task-1',
        title: 'Updated Series',
        category: 'Work',
        xpValue: 50,
        context: '',
        recurrence: 'daily',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: ['09:00', '17:00'],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      expect(mockUpdateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          recurrence: 'daily',
          timesOfDay: ['09:00', '17:00'],
        }),
        'series',
      );
    });
  });

  describe('handleDeleteTask', () => {
    it('should delete a single task', async () => {
      const mockDeleteTask = vi.fn().mockResolvedValue({
        deletedIds: ['task-1'],
      });

      const initialTasks = [
        createMockTask({ id: 'task-1' }),
        createMockTask({ id: 'task-2' }),
      ];

      const { result } = renderHook(() =>
        useTaskOperations({
          deleteTask: mockDeleteTask,
          setTaskItems: mockSetTaskItems,
          closeManageModal: mockCloseManageModal,
        }),
      );

      await act(async () => {
        await result.current.handleDeleteTask(initialTasks[0], 'single');
      });

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1', 'single');
      expect(mockSetTaskItems).toHaveBeenCalled();
      expect(mockCloseManageModal).toHaveBeenCalled();
    });

    it('should delete a series', async () => {
      const mockDeleteTask = vi.fn().mockResolvedValue({
        deletedIds: ['task-1', 'task-2', 'task-3'],
      });

      const { result } = renderHook(() =>
        useTaskOperations({
          deleteTask: mockDeleteTask,
          setTaskItems: mockSetTaskItems,
          closeManageModal: mockCloseManageModal,
        }),
      );

      const task = createMockTask({ id: 'task-1', sourceRecurringTaskId: 'recurring-1' });

      await act(async () => {
        await result.current.handleDeleteTask(task, 'all');
      });

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1', 'series');
    });
  });

  describe('handleComplete', () => {
    it('should complete a task and update XP', async () => {
      const mockCompleteTask = vi.fn().mockResolvedValue({
        task: createMockTask({ id: 'task-1', completed: true }),
        xp: {
          level: 5,
          totalXp: 1000,
          xpIntoLevel: 100,
          xpToNext: 200,
          progress: 0.5,
        },
      });

      const { result } = renderHook(() =>
        useTaskOperations({
          completeTask: mockCompleteTask,
          setTaskItems: mockSetTaskItems,
          updateXpFromSnapshot: mockUpdateXpFromSnapshot,
        }),
      );

      const task = createMockTask({ id: 'task-1', completed: false });

      await act(async () => {
        await result.current.handleComplete(task);
      });

      expect(mockCompleteTask).toHaveBeenCalledWith('task-1');
      expect(mockSetTaskItems).toHaveBeenCalled();
      expect(mockUpdateXpFromSnapshot).toHaveBeenCalledWith({
        level: 5,
        totalXp: 1000,
        xpIntoLevel: 100,
        xpToNext: 200,
        progress: 0.5,
      });
    });

    it('should not complete an already completed task', async () => {
      const mockCompleteTask = vi.fn();

      const { result } = renderHook(() =>
        useTaskOperations({
          completeTask: mockCompleteTask,
          setTaskItems: mockSetTaskItems,
        }),
      );

      const task = createMockTask({ id: 'task-1', completed: true });

      await act(async () => {
        await result.current.handleComplete(task);
      });

      expect(mockCompleteTask).not.toHaveBeenCalled();
    });
  });

  describe('handleCompleteWithLoading', () => {
    it('should track completing state', async () => {
      const mockCompleteTask = vi.fn().mockResolvedValue({
        task: createMockTask({ id: 'task-1', completed: true }),
      });

      const { result } = renderHook(() =>
        useTaskOperations({
          completeTask: mockCompleteTask,
          setTaskItems: mockSetTaskItems,
        }),
      );

      const task = createMockTask({ id: 'task-1', completed: false });

      act(() => {
        result.current.handleCompleteWithLoading(task);
      });

      expect(result.current.completingId).toBe('task-1');

      await waitFor(() => {
        expect(result.current.completingId).toBeNull();
      });
    });

    it('should prevent multiple simultaneous completions', async () => {
      const mockCompleteTask = vi.fn().mockResolvedValue({
        task: createMockTask({ id: 'task-1', completed: true }),
      });

      const { result } = renderHook(() =>
        useTaskOperations({
          completeTask: mockCompleteTask,
          setTaskItems: mockSetTaskItems,
        }),
      );

      const task1 = createMockTask({ id: 'task-1', completed: false });
      const task2 = createMockTask({ id: 'task-2', completed: false });

      act(() => {
        result.current.handleCompleteWithLoading(task1);
      });

      expect(result.current.completingId).toBe('task-1');

      // Try to complete another task while one is completing
      act(() => {
        result.current.handleCompleteWithLoading(task2);
      });

      // Should still be completing task1
      expect(result.current.completingId).toBe('task-1');
    });
  });

  describe('edge cases', () => {
    it('should handle missing API methods gracefully', async () => {
      const { result } = renderHook(() =>
        useTaskOperations({
          setTaskItems: mockSetTaskItems,
        }),
      );

      const formValues: TaskFormValues = {
        title: 'New Task',
        category: 'Work',
        xpValue: 50,
        context: '',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      // Should not throw, just log warning
      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      expect(mockSetTaskItems).not.toHaveBeenCalled();
    });

    it('should normalize invalid dates to null', async () => {
      const mockCreateTask = vi.fn().mockResolvedValue({
        tasks: [createMockTask()],
      });

      const mockUpdateTask = vi.fn();
      const { result } = renderHook(() =>
        useTaskOperations({
          createTask: mockCreateTask,
          updateTask: mockUpdateTask,
          setTaskItems: mockSetTaskItems,
          editorMode: 'create',
        }),
      );

      const formValues: TaskFormValues = {
        title: 'Task',
        category: 'Work',
        xpValue: 50,
        context: '',
        startDate: 'invalid-date',
        startTime: 'invalid-time',
        dueDate: 'invalid-date',
        dueTime: 'invalid-time',
        recurrence: 'none',
        recurrenceDays: [],
        recurrenceMonthDays: [],
        timesOfDay: [],
      };

      await act(async () => {
        await result.current.handleSubmitTask(formValues);
      });

      const callArgs = mockCreateTask.mock.calls[0][0];
      expect(callArgs.startDate).toBeNull();
      expect(callArgs.startTime).toBeNull();
      expect(callArgs.dueDate).toBeNull();
      expect(callArgs.dueTime).toBeNull();
    });
  });
});

