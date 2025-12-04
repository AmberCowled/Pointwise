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
import {
  verifyTaskOwnership,
  verifyTaskOwnershipWithSelect,
} from '@pointwise/lib/api/auth-helpers';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { taskId } = await params;
    if (!taskId) {
      return errorResponse('Task ID required', 400);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseUpdateTaskBody(rawBody);
    if (!parsed.success) {
      return errorResponse(parsed.error, parsed.status);
    }
    const updates = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const ownership = await verifyTaskOwnership(tx, taskId, email);
      if (!ownership.success) {
        return null;
      }

      const data: Record<string, unknown> = {};
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.category !== undefined) data.category = updates.category;
      if (updates.xpValue !== undefined) data.xpValue = updates.xpValue;
      if (updates.context !== undefined) data.description = updates.context;
      if ('startAt' in updates) data.startAt = updates.startAt ?? null;
      if ('dueAt' in updates) data.dueAt = updates.dueAt ?? null;

      if (Object.keys(data).length === 0) return ownership.task;

      return tx.task.update({
        where: { id: taskId },
        data,
      });
    });

    if (!updated) {
      return errorResponse('Task not found', 404);
    }

    return jsonResponse({ task: serializeTask(updated) });
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(async () => {
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

    const result = await prisma.$transaction(async (tx) => {
      const ownership = await verifyTaskOwnershipWithSelect(tx, taskId, email, {
        id: true,
        userId: true,
        sourceRecurringTaskId: true,
      });
      if (!ownership.success) {
        return null;
      }
      const task = ownership.task;

      if (scope === 'series' && task.sourceRecurringTaskId) {
        const recurringId = task.sourceRecurringTaskId;
        const relatedTasks = await tx.task.findMany({
          where: {
            OR: [{ id: taskId }, { sourceRecurringTaskId: recurringId }],
            user: { email },
          },
          select: { id: true },
        });
        await tx.task.deleteMany({
          where: {
            OR: [{ id: taskId }, { sourceRecurringTaskId: recurringId }],
            user: { email },
          },
        });
        await tx.recurringTask.delete({
          where: { id: recurringId },
        });
        return relatedTasks.map((item) => item.id);
      }

      await tx.task.delete({
        where: { id: taskId },
      });
      return [taskId];
    });

    if (!result) {
      return errorResponse('Task not found', 404);
    }

    return jsonResponse({ deletedIds: result });
  });
}
