import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { startOfDay } from '@pointwise/lib/datetime';
import { parseCreateTaskBody } from '@pointwise/lib/validation/tasks';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import { serializeTask } from '@pointwise/lib/tasks';
import type { RecurrencePattern } from '@pointwise/lib/api/types';
import {
  verifyProjectAccess,
  userCanEditTasks,
} from '@pointwise/lib/api/project-access';

export async function POST(req: Request) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseCreateTaskBody(rawBody);
    if (!parsed.success) {
      return errorResponse(parsed.error, parsed.status);
    }

    const {
      projectId,
      title,
      category,
      xpValue,
      context,
      startDate,
      startTime,
      dueDate,
      dueTime,
      recurrence,
      recurrenceDays,
      recurrenceMonthDays,
      timesOfDay,
    } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, preferredTimeZone: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify user has access to project and can edit tasks
    const projectAccess = await prisma.$transaction(async (tx) => {
      return await verifyProjectAccess(tx, projectId, user.id);
    });

    if (!projectAccess.success) {
      return errorResponse(
        projectAccess.status === 404 ? 'Project not found' : 'Access denied',
        projectAccess.status,
      );
    }

    // Check if user can edit tasks (admins and users can, viewers cannot)
    if (!userCanEditTasks(projectAccess.project, user.id)) {
      return errorResponse('Viewers cannot create tasks', 403);
    }

    // Get user's timezone for date calculations (default to UTC)
    const userTimeZone = user.preferredTimeZone ?? 'UTC';

    // Convert dates to Date objects (stored in UTC)
    const startDateValue = startDate ? new Date(startDate) : null;
    const dueDateValue = dueDate ? new Date(dueDate) : null;

    if (recurrence === 'none') {
      // Create single task (not recurring)
      const task = await prisma.task.create({
        data: {
          projectId,
          userId: user.id,
          title,
          description: context,
          category,
          xpValue,
          startDate: startDateValue,
          startTime,
          dueDate: dueDateValue,
          dueTime,
          createdBy: user.id,
          assignedUserIds: [] as any,
          acceptedUserIds: [] as any,
          isRecurringInstance: false,
          sourceRecurringTaskId: null,
          recurrenceInstanceKey: null,
          isEditedInstance: false,
          editedInstanceKeys: [] as any,
        } as any,
      });

      return jsonResponse({ tasks: [serializeTask(task)] }, 201);
    } else {
      // Create recurring task template
      // Build recurrence pattern object
      // Use provided startDate or default to today
      const patternStartDate = startDateValue || startOfDay(new Date(), userTimeZone);
      
      // Build recurrencePattern
      const recurrencePattern: RecurrencePattern = {
        type: recurrence,
        interval: 1, // Default to 1 (every day/week/month)
        daysOfWeek: recurrence === 'weekly' ? recurrenceDays : undefined,
        daysOfMonth: recurrence === 'monthly' ? recurrenceMonthDays : undefined,
        timesOfDay: timesOfDay.length > 0 ? timesOfDay : [], // Empty = date-only recurring tasks
        startDate: patternStartDate.toISOString().split('T')[0], // YYYY-MM-DD
        endDate: undefined, // Can be set later if needed
        maxOccurrences: recurrence === 'daily' ? 30 : recurrence === 'weekly' ? 12 : 12,
      };

      // Create recurring task template (not an instance)
      const templateTask = await prisma.task.create({
        data: {
          userId: user.id,
          title,
          description: context,
          category,
          xpValue,
          startDate: startDateValue,
          startTime: null, // Template doesn't have specific time
          dueDate: dueDateValue,
          dueTime: null, // Template doesn't have specific time
          assignedUserIds: [] as any,
          acceptedUserIds: [] as any,
          recurrencePattern: recurrencePattern as any, // Prisma Json type
          isRecurringInstance: false,
          sourceRecurringTaskId: null,
          recurrenceInstanceKey: null,
          isEditedInstance: false,
          editedInstanceKeys: [] as any,
        } as any,
      });

      // Return template task - client will generate instances on-demand
      return jsonResponse({ tasks: [serializeTask(templateTask)] }, 201);
    }
  });
}

