import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import { serializeTask } from '@pointwise/lib/tasks';
import { verifyTaskOwnershipWithSelect } from '@pointwise/lib/api/auth-helpers';

export async function POST(
  _req: Request,
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

    const result = await prisma.$transaction(async (tx) => {
      const ownership = await verifyTaskOwnershipWithSelect(tx, taskId, email, {
        id: true,
        userId: true,
        title: true,
        description: true,
        category: true,
        xpValue: true,
        startAt: true,
        dueAt: true,
        completedAt: true,
        sourceRecurringTaskId: true,
      });

      if (!ownership.success) {
        return {
          status: ownership.status as 404 | 403,
        };
      }

      const task = ownership.task;
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true, xp: true },
      });

      if (!user) {
        return { status: 403 as const };
      }

      let updatedTask = task;
      let nextXp = user.xp ?? 0;
      const xpIncrement = Math.max(0, task.xpValue ?? 0);

      if (!task.completedAt) {
        updatedTask = await tx.task.update({
          where: { id: task.id },
          data: { completedAt: new Date() },
        });
        nextXp = nextXp + xpIncrement;
        await tx.user.update({
          where: { id: user.id },
          data: { xp: nextXp },
        });
      }

      const xpSnapshot = levelFromXp(nextXp);

      return {
        status: 200 as const,
        task: updatedTask,
        xpSnapshot,
        totalXp: nextXp,
      };
    });

    if (result.status !== 200) {
      const message = result.status === 404 ? 'Task not found' : 'Forbidden';
      return errorResponse(message, result.status);
    }

    return jsonResponse({
      task: serializeTask(result.task),
      xp: {
        totalXp: result.totalXp,
        ...result.xpSnapshot,
      },
    });
  });
}
