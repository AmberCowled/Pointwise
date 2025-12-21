import { verifyTaskOwnershipWithSelect } from "@pointwise/lib/api/auth-helpers";
import {
  errorResponse,
  handleRoute,
  jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { getServerSession } from "next-auth";

/**
 * GET /api/tasks/[taskId]/recurring
 * Get RecurringTask data for a task (if it's part of a recurring series)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return errorResponse("Unauthorized", 401);
    }

    const { taskId } = await params;
    if (!taskId) {
      return errorResponse("Task ID required", 400);
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

      // Fetch source Task (the recurring template task)
      const sourceTask = await tx.task.findUnique({
        where: { id: task.sourceRecurringTaskId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          xpValue: true,
          startDate: true,
          recurrencePattern: true,
        },
      });

      if (!sourceTask || !sourceTask.recurrencePattern) {
        return { isRecurring: false, recurringTask: null };
      }

      // Parse recurrence pattern from JSON
      let recurrencePattern: any = null;
      try {
        recurrencePattern =
          typeof sourceTask.recurrencePattern === "string"
            ? JSON.parse(sourceTask.recurrencePattern)
            : sourceTask.recurrencePattern;
      } catch {
        return { isRecurring: false, recurringTask: null };
      }

      return {
        isRecurring: true,
        recurringTask: {
          id: sourceTask.id,
          title: sourceTask.title,
          description: sourceTask.description,
          category: sourceTask.category,
          xpValue: sourceTask.xpValue,
          startAt: sourceTask.startDate?.toISOString() ?? null,
          recurrence: recurrencePattern?.type ?? "daily",
          recurrenceDays: recurrencePattern?.daysOfWeek ?? null,
          recurrenceMonthDays: recurrencePattern?.daysOfMonth ?? null,
          timesOfDay: recurrencePattern?.timesOfDay ?? null,
        },
      };
    });

    if (!result) {
      return errorResponse("Task not found", 404);
    }

    return jsonResponse(result);
  });
}
