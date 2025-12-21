/**
 * Task Conversion Handlers
 *
 * Handles conversion between task types:
 * - One-time ↔ Recurring template
 * - Instance editing
 * - Series updates
 *
 * All conversions preserve state (especially optional task fields).
 */

import type {
  RecurrencePattern,
  UpdateTaskRequest,
} from "@pointwise/lib/api/types";
import { startOfDay } from "@pointwise/lib/datetime";
import type { Prisma } from "@prisma/client";
import {
  buildRecurrencePattern,
  buildUpdateData,
  buildUpdateDataWithDateTime,
  clearRecurrenceFields,
  preserveDateTimeFields,
  setRecurrenceTemplateFields,
  type TaskWithDateTime,
} from "./task-update-utils";

/**
 * Convert a recurring template task to a one-time task
 * Deletes all instances and removes recurrence pattern
 *
 * @returns Updated task (now one-time)
 */
export async function convertToOneTime(
  tx: Prisma.TransactionClient,
  taskId: string,
  task: TaskWithDateTime & { id: string },
  updates: UpdateTaskRequest,
  userId: string,
): Promise<any> {
  // Delete all instances
  await tx.task.deleteMany({
    where: {
      sourceRecurringTaskId: taskId,
      userId,
    },
  });

  // Preserve date/time fields
  const preserved = preserveDateTimeFields(task, updates);

  // Build update data
  const data: Record<string, unknown> = {
    ...clearRecurrenceFields(),
    ...preserved,
    ...buildUpdateData(updates),
  };

  // Update template to be a single task
  const updated = await tx.task.update({
    where: { id: taskId },
    data,
  });

  return updated;
}

/**
 * Convert a one-time task to a recurring template
 * Adds recurrence pattern, task becomes template
 *
 * @returns Updated task (now recurring template)
 */
export async function convertToRecurring(
  tx: Prisma.TransactionClient,
  taskId: string,
  task: TaskWithDateTime & { id: string },
  updates: UpdateTaskRequest,
  userTimeZone: string,
): Promise<any> {
  if (!updates.recurrence || updates.recurrence === "none") {
    throw new Error("Recurrence type required for conversion");
  }

  // Preserve date/time fields
  const preserved = preserveDateTimeFields(task, updates);

  // Calculate pattern start date (use preserved or today)
  const patternStartDate = preserved.startDate
    ? startOfDay(preserved.startDate, userTimeZone)
    : startOfDay(new Date(), userTimeZone);

  // Build recurrence pattern
  const recurrencePattern = buildRecurrencePattern({
    type: updates.recurrence,
    daysOfWeek: updates.recurrenceDays,
    daysOfMonth: updates.recurrenceMonthDays,
    timesOfDay: updates.timesOfDay,
    startDate: patternStartDate,
    endDate: undefined,
    maxOccurrences: undefined, // Use defaults from buildRecurrencePattern
  });

  // Build update data
  const data: Record<string, unknown> = {
    ...setRecurrenceTemplateFields(recurrencePattern),
    ...preserved,
    ...buildUpdateData(updates),
  };

  // Update task to be template
  const updated = await tx.task.update({
    where: { id: taskId },
    data,
  });

  return updated;
}

/**
 * Update a recurring series (change recurrence pattern)
 * Deletes non-edited instances, updates template
 *
 * @returns Array of remaining tasks (template + edited instances)
 */
export async function updateRecurrencePattern(
  tx: Prisma.TransactionClient,
  taskId: string,
  task: TaskWithDateTime & { id: string; editedInstanceKeys?: string[] },
  updates: UpdateTaskRequest,
  userTimeZone: string,
  userId: string,
): Promise<any[]> {
  if (!updates.recurrence || updates.recurrence === "none") {
    throw new Error("Recurrence type required for pattern update");
  }

  // Preserve date/time fields
  const preserved = preserveDateTimeFields(task, updates);

  // Calculate pattern start date
  const patternStartDate = preserved.startDate
    ? startOfDay(preserved.startDate, userTimeZone)
    : startOfDay(new Date(), userTimeZone);

  // Build new pattern
  const recurrencePattern = buildRecurrencePattern({
    type: updates.recurrence,
    daysOfWeek: updates.recurrenceDays,
    daysOfMonth: updates.recurrenceMonthDays,
    timesOfDay: updates.timesOfDay,
    startDate: patternStartDate,
    endDate: undefined,
    maxOccurrences: undefined,
  });

  // Get edited instance keys to preserve
  const editedKeys = (task.editedInstanceKeys as string[]) || [];

  // Delete all non-edited instances (client will regenerate)
  await tx.task.deleteMany({
    where: {
      sourceRecurringTaskId: taskId,
      isEditedInstance: false as any,
      userId,
    } as any,
  });

  // Update template with new pattern and preserved fields
  const templateData: Record<string, unknown> = {
    recurrencePattern: recurrencePattern as any,
    editedInstanceKeys: editedKeys,
    ...preserved,
    ...buildUpdateData(updates),
  };

  await tx.task.update({
    where: { id: taskId },
    data: templateData,
  });

  // Fetch remaining tasks (template + edited instances)
  const remainingTasks = await tx.task.findMany({
    where: {
      OR: [
        { id: taskId },
        {
          sourceRecurringTaskId: taskId,
          userId,
        },
      ],
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return remainingTasks;
}

/**
 * Update a single task (may mark instance as edited)
 *
 * @returns Updated task
 */
export async function updateSingleTask(
  tx: Prisma.TransactionClient,
  taskId: string,
  task: TaskWithDateTime & {
    id: string;
    isRecurringInstance?: boolean;
    sourceRecurringTaskId?: string | null;
    recurrenceInstanceKey?: string | null;
  },
  updates: UpdateTaskRequest,
): Promise<any> {
  // If it's an instance, mark it as edited
  const isInstance = task.isRecurringInstance && task.sourceRecurringTaskId;

  if (isInstance && task.sourceRecurringTaskId) {
    // Get template to update editedInstanceKeys
    const template = await tx.task.findUnique({
      where: { id: task.sourceRecurringTaskId },
      select: { editedInstanceKeys: true as any } as any,
    });

    if (template) {
      const editedKeys =
        ((template as any).editedInstanceKeys as string[]) || [];
      const instanceKey =
        task.recurrenceInstanceKey ||
        `${task.startDate?.toISOString() || ""}-${task.startTime || ""}`;

      if (!editedKeys.includes(instanceKey)) {
        editedKeys.push(instanceKey);
        await tx.task.update({
          where: { id: task.sourceRecurringTaskId },
          data: { editedInstanceKeys: editedKeys as any } as any,
        });
      }

      // Mark this instance as edited
      await tx.task.update({
        where: { id: taskId },
        data: { isEditedInstance: true as any } as any,
      });
    }
  }

  // Preserve date/time fields
  const preserved = preserveDateTimeFields(task, updates);

  // Build update data
  const data = buildUpdateDataWithDateTime(updates, preserved);

  if (Object.keys(data).length === 0) {
    return task;
  }

  // Update the task
  const updated = await tx.task.update({
    where: { id: taskId },
    data,
  });

  return updated;
}

/**
 * Update all tasks in a recurring series (template + non-edited instances)
 *
 * @returns Array of all tasks in series
 */
export async function updateSeriesTasks(
  tx: Prisma.TransactionClient,
  taskId: string,
  task: TaskWithDateTime & { id: string },
  updates: UpdateTaskRequest,
  userId: string,
): Promise<any[]> {
  // Preserve date/time fields
  const preserved = preserveDateTimeFields(task, updates);

  // Update template
  const templateData = buildUpdateDataWithDateTime(updates, preserved);

  if (Object.keys(templateData).length > 0) {
    await tx.task.update({
      where: { id: taskId },
      data: templateData,
    });
  }

  // Update all non-edited instances
  const instanceData = buildUpdateDataWithDateTime(updates, preserved);

  if (Object.keys(instanceData).length > 0) {
    await tx.task.updateMany({
      where: {
        sourceRecurringTaskId: taskId,
        isEditedInstance: false as any,
        userId,
      } as any,
      data: instanceData,
    });
  }

  // Fetch all tasks in the series
  const allTasks = await tx.task.findMany({
    where: {
      OR: [
        { id: taskId },
        {
          sourceRecurringTaskId: taskId,
          userId,
        },
      ],
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return allTasks;
}
