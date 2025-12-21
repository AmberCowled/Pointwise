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
    startDate: Date;
    startTime: string | null;
    dueDate: Date | null;
    dueTime: string | null;
    sourceRecurringTaskId: string;
  } = {
    userId: taskInfo.userId,
    title: taskInfo.title,
    category: taskInfo.category || "", // Default to empty string if null
    xpValue: taskInfo.xpValue,
    startDate: occurrence, // Set date to occurrence date
    startTime: null, // No specific time = optional task
    dueDate: null, // Optional recurring tasks don't have due dates
    dueTime: null,
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
  projectId: string; // NEW: Tasks belong to projects
  title: string;
  context: string | null;
  category: string | null;
  xp: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  completed: boolean;
  startDate: string | null;
  startTime: string | null;
  dueDate: string | null;
  dueTime: string | null;
  completedAt: string | null;

  // Assignment (for Phase 3)
  assignedUserIds?: string[];
  acceptedUserIds?: string[];

  // Recurring pattern (if this is a recurring task template)
  recurrencePattern?: {
    type: "daily" | "weekly" | "monthly";
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    timesOfDay?: string[];
    startDate: string;
    endDate?: string;
    maxOccurrences?: number;
  };

  // Recurring instance tracking
  isRecurringInstance: boolean;
  sourceRecurringTaskId: string | null;
  recurrenceInstanceKey?: string | null;
  isEditedInstance?: boolean;
  editedInstanceKeys?: string[];
};

/**
 * Task input type for serialization (from Prisma)
 */
export type TaskInput = {
  id: string;
  projectId: string; // NEW: Tasks belong to projects
  title: string;
  description: string | null;
  category: string | null;
  xpValue: number | null;
  startDate: Date | null;
  startTime: string | null;
  dueDate: Date | null;
  dueTime: string | null;
  completedAt?: Date | null;
  status?: string;

  // Assignment (for Phase 3)
  assignedUserIds?: string[];
  acceptedUserIds?: string[];

  // Recurring pattern (JSON from Prisma)
  recurrencePattern?: any;

  // Recurring instance tracking
  isRecurringInstance?: boolean;
  sourceRecurringTaskId?: string | null;
  recurrenceInstanceKey?: string | null;
  isEditedInstance?: boolean;
  editedInstanceKeys?: string[];

  // Metadata
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  // Parse recurrencePattern from JSON if it exists
  let recurrencePattern: SerializedTask["recurrencePattern"];
  if (task.recurrencePattern) {
    try {
      const parsed =
        typeof task.recurrencePattern === "string"
          ? JSON.parse(task.recurrencePattern)
          : task.recurrencePattern;
      recurrencePattern = parsed;
    } catch {
      // Invalid JSON, leave as undefined
    }
  }

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    context: task.description,
    category: task.category,
    xp: task.xpValue ?? 0,
    status:
      (task.status as SerializedTask["status"]) ||
      (task.completedAt ? "completed" : "pending"),
    completed: Boolean(task.completedAt),
    startDate: task.startDate
      ? task.startDate.toISOString().split("T")[0]
      : null,
    startTime: task.startTime ?? null,
    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
    dueTime: task.dueTime ?? null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,

    // Assignment (for Phase 3)
    assignedUserIds: task.assignedUserIds ?? [],
    acceptedUserIds: task.acceptedUserIds ?? [],

    // Recurring pattern
    recurrencePattern,

    // Recurring instance tracking
    isRecurringInstance: task.isRecurringInstance ?? false,
    sourceRecurringTaskId: task.sourceRecurringTaskId ?? null,
    recurrenceInstanceKey: task.recurrenceInstanceKey ?? null,
    isEditedInstance: task.isEditedInstance ?? false,
    editedInstanceKeys: task.editedInstanceKeys ?? [],
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
