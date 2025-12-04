/**
 * Task serialization and utility functions
 */

/**
 * Create task data object from recurring task info and occurrence date
 * Used for creating tasks from recurring task occurrences
 */
export function createTaskDataFromRecurring(
  taskInfo: {
    userId: string;
    title: string;
    description: string | null;
    category: string | null;
    xpValue: number;
    recurringTaskId: string;
  },
  occurrence: Date,
) {
  // Category and description from recurring tasks may be null, but Prisma expects string or undefined
  // Note: Prisma schema requires category to be String (not optional), but we handle null from recurring tasks
  const data: {
    userId: string;
    title: string;
    description?: string;
    category: string;
    xpValue: number;
    startAt: Date;
    dueAt: Date;
    sourceRecurringTaskId: string;
  } = {
    userId: taskInfo.userId,
    title: taskInfo.title,
    category: taskInfo.category || '', // Default to empty string if null
    xpValue: taskInfo.xpValue,
    startAt: occurrence,
    dueAt: occurrence,
    sourceRecurringTaskId: taskInfo.recurringTaskId,
  };

  if (taskInfo.description) {
    data.description = taskInfo.description;
  }

  return data;
}

/**
 * Serialized task format for API responses
 */
export type SerializedTask = {
  id: string;
  title: string;
  context: string | null;
  category: string | null;
  xp: number;
  status: 'scheduled' | 'completed';
  completed: boolean;
  startAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  sourceRecurringTaskId: string | null;
};

/**
 * Task input type for serialization (from Prisma)
 */
export type TaskInput = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  xpValue: number | null;
  startAt: Date | null;
  dueAt: Date | null;
  completedAt?: Date | null;
  sourceRecurringTaskId?: string | null;
};

/**
 * Task type for merging (compatible with DashboardTask)
 */
export type MergeableTask = {
  id: string;
  [key: string]: unknown;
};

/**
 * Serialize a Prisma task to API response format
 *
 * @param task - Task from Prisma query
 * @returns Serialized task for API response
 *
 * @example
 * ```typescript
 * const task = await prisma.task.findUnique({ where: { id } });
 * const serialized = serializeTask(task);
 * return jsonResponse({ task: serialized });
 * ```
 */
export function serializeTask(task: TaskInput): SerializedTask {
  return {
    id: task.id,
    title: task.title,
    context: task.description,
    category: task.category,
    xp: task.xpValue ?? 0,
    status: task.completedAt ? 'completed' : 'scheduled',
    completed: Boolean(task.completedAt),
    startAt: task.startAt ? task.startAt.toISOString() : null,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    sourceRecurringTaskId: task.sourceRecurringTaskId ?? null,
  };
}

/**
 * Merge new tasks into an existing array, replacing tasks with matching IDs
 *
 * This function is useful for updating task state when receiving new or updated
 * tasks from the API. Tasks with matching IDs are replaced, and new tasks are added.
 *
 * @param existing - Existing array of tasks
 * @param newTasks - New tasks to merge (single task or array)
 * @returns Merged array with updated/new tasks
 *
 * @example
 * ```typescript
 * // Merge a single task
 * setTaskItems((prev) => mergeTasks(prev, [newTask]));
 *
 * // Merge multiple tasks
 * setTaskItems((prev) => mergeTasks(prev, [task1, task2, task3]));
 * ```
 */
export function mergeTasks<T extends MergeableTask>(
  existing: T[],
  newTasks: T | T[],
): T[] {
  const tasksToMerge = Array.isArray(newTasks) ? newTasks : [newTasks];
  const taskMap = new Map<string, T>();

  // Add all existing tasks to the map
  for (const task of existing) {
    taskMap.set(task.id, task);
  }

  // Update or add new tasks
  for (const task of tasksToMerge) {
    taskMap.set(task.id, task);
  }

  // Return as array, preserving order (existing first, then new)
  return Array.from(taskMap.values());
}
