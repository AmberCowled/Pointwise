import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  verifyTaskOwnershipWithSelect,
} from '@pointwise/lib/api/auth-helpers';

/**
 * GET /api/tasks/[taskId]/recurring
 * Get RecurringTask data for a task (if it's part of a recurring series)
 */
export async function GET(
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

    const result = await prisma.$transaction(async (tx) => {
      // Verify task ownership and get sourceRecurringTaskId
      const ownership = await verifyTaskOwnershipWithSelect(tx, taskId, email, {
        id: true,
        userId: true,
        sourceRecurringTaskId: true,
      });

      if (!ownership.success) {
        return null;
      }

      const task = ownership.task;

      if (!task.sourceRecurringTaskId) {
        return { isRecurring: false, recurringTask: null };
      }

      // Fetch RecurringTask data
      const recurringTask = await tx.recurringTask.findUnique({
        where: { id: task.sourceRecurringTaskId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          xpValue: true,
          startAt: true,
          recurrenceType: true,
          timesOfDay: true,
          daysOfWeek: true,
          monthDays: true,
        },
      });

      if (!recurringTask) {
        return { isRecurring: false, recurringTask: null };
      }

      // Convert RecurrenceType enum to string format
      const recurrenceTypeMap: Record<string, 'none' | 'daily' | 'weekly' | 'monthly'> = {
        DAILY: 'daily',
        WEEKLY: 'weekly',
        MONTHLY: 'monthly',
      };

      return {
        isRecurring: true,
        recurringTask: {
          id: recurringTask.id,
          title: recurringTask.title,
          description: recurringTask.description,
          category: recurringTask.category,
          xpValue: recurringTask.xpValue,
          startAt: recurringTask.startAt?.toISOString() ?? null,
          recurrence: recurrenceTypeMap[recurringTask.recurrenceType] ?? 'daily',
          recurrenceDays: recurringTask.daysOfWeek,
          recurrenceMonthDays: recurringTask.monthDays,
          timesOfDay: recurringTask.timesOfDay,
        },
      };
    });

    if (!result) {
      return errorResponse('Task not found', 404);
    }

    return jsonResponse(result);
  });
}

