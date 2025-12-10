/**
 * Project Tasks API
 * 
 * Handles listing and filtering tasks within a project
 * - GET /api/projects/:id/tasks - List tasks in project
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import { serializeTask } from '@pointwise/lib/tasks';
import { verifyProjectAccess } from '@pointwise/lib/api/project-access';

/**
 * GET /api/projects/:id/tasks
 * List all tasks in a project (filtered by query params)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId } = await params;

    if (!projectId) {
      return errorResponse('Project ID required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // pending, in_progress, completed, cancelled
    const includeCompleted = url.searchParams.get('includeCompleted') === 'true';

    // Verify access to project and get tasks
    const result = await prisma.$transaction(async (tx) => {
      // Verify user has access to project
      const projectAccess = await verifyProjectAccess(tx, projectId, user.id);

      if (!projectAccess.success) {
        return projectAccess;
      }

      // Build where clause for filtering
      const where: any = {
        projectId,
      };

      // Filter by status if provided
      if (status) {
        where.status = status;
      }

      // Filter out completed tasks by default (unless explicitly requested)
      if (!includeCompleted && !status) {
        where.status = { not: 'completed' };
      }

      // Get tasks
      const tasks = await tx.task.findMany({
        where,
        orderBy: [
          { startDate: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'asc' },
        ],
        select: {
          id: true,
          projectId: true,
          userId: true,
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
          assignedUserIds: true,
          acceptedUserIds: true,
          recurrencePattern: true,
          isRecurringInstance: true,
          sourceRecurringTaskId: true,
          recurrenceInstanceKey: true,
          isEditedInstance: true,
          editedInstanceKeys: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }) as any; // Use any to bypass Prisma type checking for new fields

      return {
        success: true,
        status: 200,
        tasks,
      };
    });

    if (!result.success) {
      return errorResponse(
        result.status === 404 ? 'Project not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      tasks: (result as any).tasks.map(serializeTask),
    });
  });
}

