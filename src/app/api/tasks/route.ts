import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { startOfDay, toDateKey } from '@pointwise/lib/datetime';
import { parseCreateTaskBody } from '@pointwise/lib/validation/tasks';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  serializeTask,
  type SerializedTask,
  createTaskDataFromRecurring,
} from '@pointwise/lib/tasks';
import {
  generateOccurrences,
  toRecurrenceType,
} from '@pointwise/lib/recurrence';

export async function POST(req: Request) {
  return handleRoute(async () => {
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
      title,
      category,
      xpValue,
      context,
      startAt,
      dueAt,
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

    // Get user's timezone for date calculations (default to UTC)
    const userTimeZone = user.preferredTimeZone ?? 'UTC';

    const tasksToReturn: SerializedTask[] = [];

    if (recurrence === 'none') {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          title,
          description: context,
          category,
          xpValue,
          startAt,
          dueAt,
        },
      });

      tasksToReturn.push(serializeTask(task));
    } else {
      // If no start/due date provided, use today in user's timezone
      // Calculate startDate: use provided startAt, or default to today
      let startDate: Date;
      if (startAt) {
        startDate = startOfDay(startAt, userTimeZone);
      } else {
        // No start date provided - use today in user's timezone
        // IMPORTANT: Create a fresh Date() each time to avoid stale timestamps
        const now = new Date();
        startDate = startOfDay(now, userTimeZone);

        // Debug: Verify the calculation
        if (process.env.NODE_ENV === 'development') {
          const startDateKey = toDateKey(startDate, userTimeZone);
          const todayKey = toDateKey(now, userTimeZone);
          if (startDateKey !== todayKey) {
            console.warn(
              '[POST /api/tasks] WARNING: startDate does not match today!',
              {
                startDate: startDate.toISOString(),
                startDateKey,
                todayKey,
                now: now.toISOString(),
                userTimeZone,
              },
            );
          }
        }
      }

      // Derive times from anchor date (dueAt, startAt, or now)
      const anchorDate = dueAt ?? startAt ?? new Date();
      const safeTimes = deriveTimesOfDay({ anchorDate, timesOfDay });

      // Determine max occurrences based on recurrence type
      // Daily: 30 occurrences (30 days)
      // Weekly: 12 occurrences (12 weeks)
      // Monthly: 12 occurrences (12 months)
      let maxOccurrences: number;
      if (recurrence === 'daily') {
        maxOccurrences = 30;
      } else if (recurrence === 'weekly') {
        maxOccurrences = 12;
      } else if (recurrence === 'monthly') {
        maxOccurrences = 12;
      } else {
        maxOccurrences = 30; // Default fallback
      }

      const occurrences = generateOccurrences({
        recurrence,
        startDate,
        recurrenceDays,
        recurrenceMonthDays,
        timesOfDay: safeTimes,
        timeZone: userTimeZone,
        maxOccurrences,
      });

      const recurringTask = await prisma.recurringTask.create({
        data: {
          userId: user.id,
          title,
          description: context,
          category,
          xpValue,
          startAt: startDate,
          recurrenceType: toRecurrenceType(recurrence) ?? 'DAILY',
          timesOfDay: safeTimes,
          daysOfWeek: recurrenceDays,
          monthDays: recurrenceMonthDays,
          nextOccurrence: occurrences[0] ?? null,
        },
      });

      // Deduplicate occurrences by ISO string (in case mergeDateAndTime shifted dates)
      const uniqueOccurrences = Array.from(
        new Map(occurrences.map((occ) => [occ.toISOString(), occ])).values(),
      );

      // Batch create all tasks at once (fixes N+1 query problem)
      const tasksToCreate = uniqueOccurrences.map((occurrence) =>
        createTaskDataFromRecurring(
          {
            userId: user.id,
            title,
            description: context,
            category,
            xpValue,
            recurringTaskId: recurringTask.id,
          },
          occurrence,
        ),
      );

      await prisma.task.createMany({
        data: tasksToCreate,
      });

      // Fetch created tasks for serialization
      // Note: createMany doesn't return records, so we fetch them back
      const createdTasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          sourceRecurringTaskId: recurringTask.id,
        },
        orderBy: {
          startAt: 'asc',
        },
      });

      tasksToReturn.push(...createdTasks.map(serializeTask));
    }

    return jsonResponse({ tasks: tasksToReturn }, 201);
  });
}

function deriveTimesOfDay({
  anchorDate,
  timesOfDay,
}: {
  anchorDate: Date | null;
  timesOfDay: string[];
}): string[] {
  if (timesOfDay.length > 0) return timesOfDay;
  if (anchorDate) {
    const hours = String(anchorDate.getHours()).padStart(2, '0');
    const minutes = String(anchorDate.getMinutes()).padStart(2, '0');
    return [`${hours}:${minutes}`];
  }
  return ['09:00'];
}
