import { verifyTaskOwnershipWithSelect } from "@pointwise/lib/api/auth-helpers";
import {
  userCanEditTasks,
  verifyProjectAccess,
} from "@pointwise/lib/api/project-access";
import {
  errorResponse,
  handleRoute,
  jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { serializeXP, updateXP } from "@pointwise/lib/api/xp";
import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { serializeTask } from "@pointwise/lib/tasks";
import { getServerSession } from "next-auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return handleRoute(_req, async () => {
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
        completedAt: true,
        status: true,
        sourceRecurringTaskId: true,
        isRecurringInstance: true,
        createdBy: true, // NEW: Include createdBy
      });

      if (!ownership.success) {
        return {
          status: ownership.status as 404 | 403,
          task: null,
          xpSnapshot: null,
          totalXp: 0,
        };
      }

      const task = ownership.task;

      // Get user for XP update
      const currentUser = await tx.user.findUnique({
        where: { email },
        select: { id: true, xp: true },
      });

      if (!currentUser) {
        return {
          status: 403 as const,
          task: null,
          xpSnapshot: null,
          totalXp: 0,
        };
      }

      // NEW: Verify user has access to the project and can edit tasks
      const projectAccess = await verifyProjectAccess(
        tx,
        task.projectId,
        currentUser.id,
      );

      if (!projectAccess.success) {
        return {
          status: 403 as const,
          task: null,
          xpSnapshot: null,
          totalXp: 0,
        };
      }

      // Check if user can edit tasks (admins and users can, viewers cannot)
      if (!userCanEditTasks(projectAccess.project, currentUser.id)) {
        return {
          status: 403 as const,
          task: null,
          xpSnapshot: null,
          totalXp: 0,
          error: "Viewers cannot complete tasks",
        };
      }

      let updatedTask = task;
      const xpIncrement = Math.max(0, task.xpValue ?? 0);

      if (!task.completedAt) {
        updatedTask = await tx.task.update({
          where: { id: task.id },
          data: {
            completedAt: new Date(),
            status: "completed" as any,
          } as any,
        });

        // Use the XP update function for single source of truth
        // Pass transaction client to maintain atomicity
        const nextXp = await updateXP(currentUser.id, { delta: xpIncrement });
        const xpSnapshot = serializeXP(nextXp);

        return {
          status: 200 as const,
          task: serializeTask(updatedTask as any),
          xpSnapshot,
          totalXp: nextXp,
        };
      }

      // Task already completed, return current XP
      const currentXp = currentUser.xp ?? 0;
      const xpSnapshot = serializeXP(currentXp);

      return {
        status: 200 as const,
        task: serializeTask(updatedTask as any),
        xpSnapshot,
        totalXp: currentXp,
      };
    });

    if (result.status !== 200) {
      const message = result.status === 404 ? "Task not found" : "Forbidden";
      return errorResponse(message, result.status);
    }

    return jsonResponse({
      task: result.task,
      xp: {
        totalXp: result.totalXp,
        ...result.xpSnapshot,
      },
    });
  });
}
