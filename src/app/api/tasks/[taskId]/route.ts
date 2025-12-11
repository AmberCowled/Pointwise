import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { parseUpdateTaskBody } from '@pointwise/lib/validation/tasks';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import { serializeTask } from '@pointwise/lib/tasks';
import { verifyTaskOwnershipWithSelect } from '@pointwise/lib/api/auth-helpers';
import { isTaskTemplate, isTaskInstance } from '@pointwise/lib/tasks/utils';
import {
  convertToOneTime,
  convertToRecurring,
  updateRecurrencePattern,
  updateSingleTask,
  updateSeriesTasks,
} from '@pointwise/lib/tasks/task-conversions';
import {
  verifyProjectAccess,
  userCanEditTasks,
} from '@pointwise/lib/api/project-access';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { taskId } = await params;
    if (!taskId) {
      return errorResponse('Task ID required', 400);
    }

    // Get scope parameter (default to 'single')
    const url = new URL(req.url);
    const scope = (url.searchParams.get('scope') ?? 'single') as
      | 'single'
      | 'series';

    if (scope !== 'single' && scope !== 'series') {
      return errorResponse(
        'Invalid scope parameter. Must be "single" or "series".',
        400,
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseUpdateTaskBody(rawBody);
    if (!parsed.success) {
      return errorResponse(parsed.error, parsed.status);
    }
    const updates = parsed.data;

    // Get user for timezone
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, preferredTimeZone: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const userTimeZone = user.preferredTimeZone ?? 'UTC';

    const result = await prisma.$transaction(async (tx) => {
      // Get task with ownership verification
      const ownership = await verifyTaskOwnershipWithSelect(tx, taskId, email, {
        id: true,
        userId: true,
        projectId: true, // NEW: Get projectId for access check
        title: true,
        description: true,
        category: true,
        xpValue: true,
        startDate: true,
        startTime: true,
        dueDate: true,
        dueTime: true,
        recurrencePattern: true,
        isRecurringInstance: true,
        sourceRecurringTaskId: true,
        recurrenceInstanceKey: true,
        isEditedInstance: true,
        editedInstanceKeys: true,
      });

      if (!ownership.success) {
        return null;
      }

      const task = ownership.task;

      // NEW: Verify user has access to the project and can edit tasks
      const projectAccess = await verifyProjectAccess(
        tx,
        task.projectId,
        user.id,
      );

      if (!projectAccess.success) {
        return null;
      }

      // Check if user can edit tasks (admins and users can, viewers cannot)
      if (!userCanEditTasks(projectAccess.project, user.id)) {
        return { error: 'Viewers cannot edit tasks', status: 403 };
      }

      // Determine task type
      const isTemplate = isTaskTemplate(task as any);
      const isInstance = isTaskInstance(task as any);

      // Check if recurrence is being changed
      const hasRecurrenceFields =
        updates.recurrence !== undefined ||
        updates.recurrenceDays !== undefined ||
        updates.recurrenceMonthDays !== undefined ||
        updates.timesOfDay !== undefined;

      const newRecurrence = updates.recurrence;

      // Determine conversion type
      const isConvertingToOneTime =
        scope === 'series' && newRecurrence === 'none' && isTemplate;
      const isConvertingToRecurring =
        scope === 'single' &&
        newRecurrence !== undefined &&
        newRecurrence !== 'none' &&
        !isTemplate &&
        !isInstance;
      const isChangingRecurrence =
        scope === 'series' &&
        hasRecurrenceFields &&
        isTemplate &&
        newRecurrence !== 'none';

      // Handle conversions
      if (isConvertingToOneTime) {
        const updated = await convertToOneTime(
          tx,
          taskId,
          task,
          updates,
          user.id,
        );
        return { type: 'single' as const, task: updated };
      }

      if (isConvertingToRecurring) {
        const updated = await convertToRecurring(
          tx,
          taskId,
          task,
          updates,
          userTimeZone,
        );
        return { type: 'single' as const, task: updated };
      }

      if (isChangingRecurrence) {
        const tasks = await updateRecurrencePattern(
          tx,
          taskId,
          task,
          updates,
          userTimeZone,
          user.id,
        );
        return { type: 'series' as const, tasks };
      }

      // Handle standard updates
      if (scope === 'single') {
        const updated = await updateSingleTask(tx, taskId, task, updates);
        return { type: 'single' as const, task: updated };
      }

      if (scope === 'series' && isTemplate) {
        const tasks = await updateSeriesTasks(
          tx,
          taskId,
          task,
          updates,
          user.id,
        );
        return { type: 'series' as const, tasks };
      }

      // Fallback: return unchanged task
      return { type: 'single' as const, task };
    });

    if (!result) {
      return errorResponse('Task not found', 404);
    }

    // NEW: Check for access error
    if ('error' in result && 'status' in result) {
      return errorResponse(result.error as string, result.status as number);
    }

    if (result.type === 'single') {
      return jsonResponse({ task: serializeTask(result.task) });
    } else {
      return jsonResponse({ tasks: result.tasks.map(serializeTask) });
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { taskId } = await params;
    if (!taskId) {
      return errorResponse('Task ID required', 400);
    }

    const scope = new URL(req.url).searchParams.get('scope') ?? 'single';

    // Get user for userId
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const ownership = await verifyTaskOwnershipWithSelect(tx, taskId, email, {
        id: true,
        userId: true,
        projectId: true, // NEW: Get projectId for access check
        isRecurringInstance: true,
        sourceRecurringTaskId: true,
        recurrencePattern: true,
      });

      if (!ownership.success) {
        return null;
      }

      const task = ownership.task;

      // NEW: Verify user has access to the project and can edit tasks
      const projectAccess = await verifyProjectAccess(
        tx,
        task.projectId,
        user.id,
      );

      if (!projectAccess.success) {
        return null;
      }

      // Check if user can edit tasks (admins and users can, viewers cannot)
      if (!userCanEditTasks(projectAccess.project, user.id)) {
        return { error: 'Viewers cannot delete tasks', status: 403 };
      }

      // Check if task is a template (has recurrence pattern, not an instance)
      const isTemplate = isTaskTemplate({
        isRecurringInstance: task.isRecurringInstance ?? false,
        recurrencePattern: task.recurrencePattern
          ? (task.recurrencePattern as any)
          : undefined,
      });

      if (scope === 'series' && isTemplate) {
        // Fetch IDs to delete first
        const toDelete = await tx.task.findMany({
          where: {
            OR: [{ id: taskId }, { sourceRecurringTaskId: taskId }],
            userId: user.id,
          },
          select: { id: true },
        });

        // Delete template and all instances
        await tx.task.deleteMany({
          where: {
            OR: [{ id: taskId }, { sourceRecurringTaskId: taskId }],
            userId: user.id,
          },
        });

        return toDelete.map((item) => item.id);
      }

      // Delete single task
      await tx.task.delete({
        where: { id: taskId },
      });
      return [taskId];
    });

    if (!result) {
      return errorResponse('Task not found', 404);
    }

    // NEW: Check for access error
    if ('error' in result && 'status' in result) {
      return errorResponse(result.error as string, result.status as number);
    }

    return jsonResponse({ deletedIds: result as string[] });
  });
}
