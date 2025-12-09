'use client';

import { useCallback, useState } from 'react';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import type { TaskFormValues } from '@pointwise/app/components/dashboard/tasks/form/types';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskResponse,
  CreateTaskResponse,
  DeleteTaskResponse,
  CompleteTaskResponse,
} from '@pointwise/lib/api/types';
import { mergeTasks } from '@pointwise/lib/tasks';
import { useProject } from '@pointwise/contexts/ProjectContext';

export interface UseTaskOperationsOptions {
  // API methods
  createTask?: (data: CreateTaskRequest) => Promise<CreateTaskResponse>;
  updateTask?: (
    taskId: string,
    data: UpdateTaskRequest,
    scope?: 'single' | 'series',
  ) => Promise<UpdateTaskResponse>;
  deleteTask?: (
    taskId: string,
    scope?: 'single' | 'series',
  ) => Promise<DeleteTaskResponse>;
  completeTask?: (taskId: string) => Promise<CompleteTaskResponse>;

  // State setters
  setTaskItems: React.Dispatch<React.SetStateAction<DashboardTask[]>>;

  // Modal state (for closing modals after operations)
  closeCreateModal?: () => void;
  closeManageModal?: () => void;
  setCreateError?: (error: string | null) => void;
  setIsCreating?: (loading: boolean) => void;

  // XP state (for complete operation)
  updateXpFromSnapshot?: (snapshot: {
    level: number;
    totalXp: number;
    xpIntoLevel?: number;
    xpToNext?: number;
    progress?: number;
  }) => void;

  // Editor state (needed for submit)
  editorMode?: 'create' | 'edit';
  editScope?: 'single' | 'series';
}

export interface UseTaskOperationsReturn {
  handleSubmitTask: (values: TaskFormValues) => Promise<void>;
  handleDeleteTask: (task: DashboardTask, scope: 'single' | 'all') => Promise<void>;
  handleComplete: (task: DashboardTask) => Promise<void>;
  handleCompleteWithLoading: (task: DashboardTask) => Promise<void>;
  completingId: string | null;
}

/**
 * Hook for managing task CRUD operations
 * 
 * Handles:
 * - Creating tasks
 * - Updating tasks (single or series)
 * - Deleting tasks (single or series)
 * - Completing tasks and updating XP
 */
export function useTaskOperations(
  options: UseTaskOperationsOptions,
): UseTaskOperationsReturn {
  const {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setTaskItems,
    closeCreateModal,
    closeManageModal,
    setCreateError,
    setIsCreating,
    updateXpFromSnapshot,
    editorMode = 'create',
    editScope = 'single',
  } = options;

  // Get current project from context
  const { currentProjectId, currentProject } = useProject();

  console.log('🔍 useTaskOperations - Project Context:', {
    currentProjectId,
    currentProjectName: currentProject?.name,
    hasContext: !!currentProjectId,
  });

  const [completingId, setCompletingId] = useState<string | null>(null);

  // Normalize date input for API
  const normalizeDateInput = useCallback((input?: string | null) => {
    if (!input) return null;
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  }, []);

  // Handle task submission (create or update)
  const handleSubmitTask = useCallback(
    async (values: TaskFormValues) => {
      if (!createTask || !updateTask) {
        console.warn('Task operations not available');
        return;
      }

      setIsCreating?.(true);
      setCreateError?.(null);

      // Date/time fields are now passed separately to the API

      try {
        if (editorMode === 'edit' && values.id) {
          const updatePayload: UpdateTaskRequest = {
            title: values.title,
            category: values.category,
            xpValue: values.xpValue,
            context: values.context,
            startDate: values.startDate || null,
            startTime: values.startTime || null,
            dueDate: values.dueDate || null,
            dueTime: values.dueTime || null,
          };

          // Determine the actual scope to use for the API call
          // If editing a single task and adding recurrence, we need to use 'series' scope
          // because the API only handles conversion to recurring when scope='series'
          const isConvertingToRecurring =
            editScope === 'single' &&
            values.recurrence &&
            values.recurrence !== 'none';

          // Detect if we're converting recurring to one-time
          // This happens when editing a series and setting recurrence to 'none'
          const isConvertingToOneTime =
            editScope === 'series' &&
            values.recurrence === 'none';

          const apiScope: 'single' | 'series' = isConvertingToRecurring ? 'series' : editScope;

          // Include recurrence fields when using 'series' scope or converting to one-time
          if (apiScope === 'series' || isConvertingToOneTime) {
            updatePayload.recurrence = values.recurrence;

            // Include recurrence settings for series operations (unless converting to one-time)
            if (!isConvertingToOneTime) {
              updatePayload.recurrenceDays = values.recurrenceDays;
              updatePayload.recurrenceMonthDays = values.recurrenceMonthDays;
              updatePayload.timesOfDay = values.timesOfDay?.filter(Boolean) || [];
            } else {
              // Clear recurrence fields when converting to one-time
              updatePayload.recurrenceDays = [];
              updatePayload.recurrenceMonthDays = [];
              updatePayload.timesOfDay = [];
            }
          }

          console.log('[useTaskOperations] Sending update to API:', {
            taskId: values.id,
            apiScope,
            isConvertingToRecurring,
            isConvertingToOneTime,
            recurrence: updatePayload.recurrence,
            valuesRecurrence: values.recurrence,
            editScope,
            updatePayloadKeys: Object.keys(updatePayload),
          });

          const payload = await updateTask(values.id, updatePayload, apiScope);
          
          console.log('[useTaskOperations] API response:', {
            hasTask: !!payload.task,
            hasTasks: !!payload.tasks,
            taskId: payload.task?.id,
            tasksCount: payload.tasks?.length,
            taskSourceRecurringTaskId: payload.task?.sourceRecurringTaskId,
          });

          // Handle response - simplified logic
          if (payload.task) {
            // Single task response: either single update or convert recurring→one-time
            if (apiScope === 'series') {
              // Series operation returned single task = converting recurring→one-time
              // Remove all tasks from the original series, then add the updated single task
              setTaskItems((prev) => {
                const originalTask = prev.find((t) => t.id === values.id);
                const seriesId = originalTask?.sourceRecurringTaskId;

                // Remove all tasks from the series (including the original task)
                const filtered = seriesId
                  ? prev.filter(t => t.sourceRecurringTaskId !== seriesId)
                  : prev.filter(t => t.id !== values.id);

                // Add the updated single task (API returns sourceRecurringTaskId: null)
                return mergeTasks(filtered, [payload.task as DashboardTask]);
              });
            } else {
              // Regular single task update
              setTaskItems((prev) => mergeTasks(prev, [payload.task as DashboardTask]));
            }
          } else if (payload.tasks && Array.isArray(payload.tasks)) {
            // Array response: series update or convert single→recurring
            setTaskItems((prev) => {
              // Remove old versions of tasks that are being updated
              const updatedIds = new Set(payload.tasks!.map((t) => t.id));
              const filtered = prev.filter(t => !updatedIds.has(t.id));

              // If converting single→recurring, also remove the original single task
              const finalFiltered = isConvertingToRecurring
                ? filtered.filter(t => t.id !== values.id)
                : filtered;

              // Merge in the new/updated tasks
              return mergeTasks(finalFiltered, payload.tasks as DashboardTask[]);
            });
          }
        } else {
          // Get projectId from context
          if (!currentProjectId) {
            throw new Error('No project selected. Please select a project to create tasks.');
          }

          console.log('🎯 Creating task with projectId:', currentProjectId);

          const payload = await createTask({
            projectId: currentProjectId,
            title: values.title,
            category: values.category,
            xpValue: values.xpValue,
            context: values.context,
            startDate: values.startDate || null,
            startTime: values.startTime || null,
            dueDate: values.dueDate || null,
            dueTime: values.dueTime || null,
            recurrence: values.recurrence ?? 'none',
            recurrenceDays: values.recurrenceDays ?? [],
            recurrenceMonthDays: values.recurrenceMonthDays ?? [],
            timesOfDay: (values.timesOfDay ?? []).filter(Boolean),
          });

          console.log('✅ Task created:', payload);

          if (Array.isArray(payload.tasks)) {
            setTaskItems((prev) => mergeTasks(prev, payload.tasks as any));
          }
        }

        // Close modals after successful operation
        // Use multiple setTimeout calls to ensure all state updates complete
        // This prevents issues with modal state and page interaction
        setTimeout(() => {
          closeCreateModal?.();
          closeManageModal?.();
        }, 0);
      } catch (error) {
        // API client handles error notifications automatically
        // Only set createError for modal inline display if needed
        const fallback =
          editorMode === 'edit' ? 'Failed to update task' : 'Failed to create task';
        const message = error instanceof Error ? error.message : fallback;
        setCreateError?.(message);
        
        // Ensure modals can still be closed even on error to prevent scrolling issues
        // Use setTimeout to allow error state to be set first
        setTimeout(() => {
          closeCreateModal?.();
          closeManageModal?.();
        }, 0);
      } finally {
        setIsCreating?.(false);
      }
    },
    [
      createTask,
      updateTask,
      editorMode,
      editScope,
      normalizeDateInput,
      setTaskItems,
      closeCreateModal,
      closeManageModal,
      setCreateError,
      setIsCreating,
      updateXpFromSnapshot,
    ],
  );

  // Handle task deletion
  const handleDeleteTask = useCallback(
    async (task: DashboardTask, scope: 'single' | 'all') => {
      if (!deleteTask) {
        console.warn('Delete task operation not available');
        return;
      }

      try {
        const deleteScope = scope === 'all' ? 'series' : 'single';
        const payload = await deleteTask(task.id, deleteScope);
        const deletedIds: string[] = payload.deletedIds ?? [task.id];
        setTaskItems((prev) =>
          prev.filter((item) => !deletedIds.includes(item.id)),
        );
        closeManageModal?.();
      } catch {
        // API client handles error notifications automatically
      }
    },
    [deleteTask, setTaskItems, closeManageModal],
  );

  // Handle task completion
  const handleComplete = useCallback(
    async (task: DashboardTask) => {
      if (!completeTask || task.completed) return;

      try {
        const payload = await completeTask(task.id);

        if (payload.task) {
          setTaskItems((prev) => mergeTasks(prev, [payload.task as DashboardTask]));
        }

        if (payload.xp && updateXpFromSnapshot) {
          updateXpFromSnapshot(payload.xp);
        }
      } catch {
        // API client handles error notifications automatically
      }
    },
    [completeTask, setTaskItems, updateXpFromSnapshot],
  );

  // Handle complete with loading state tracking
  const handleCompleteWithLoading = useCallback(
    async (task: DashboardTask) => {
      if (task.completed || completingId) return;
      setCompletingId(task.id);
      try {
        await handleComplete(task);
      } finally {
        setCompletingId(null);
      }
    },
    [handleComplete, completingId],
  );

  return {
    handleSubmitTask,
    handleDeleteTask,
    handleComplete,
    handleCompleteWithLoading,
    completingId,
  };
}

