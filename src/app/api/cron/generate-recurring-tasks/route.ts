import { NextResponse } from 'next/server';
import prisma from '@pointwise/lib/prisma';
import {
  startOfDay,
  mergeDateAndTime,
  toDateKey,
} from '@pointwise/lib/datetime';
import {
  findNextOccurrence,
  generateOccurrences,
  RECURRENCE_CONFIG,
  DAYS_IN_WEEK,
} from '@pointwise/lib/recurrence';
import { createTaskDataFromRecurring } from '@pointwise/lib/tasks';
import { MS_PER_DAY } from '@pointwise/lib/recurrence/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron job to extend recurring task buffers
 * Should run daily to maintain buffer windows for all recurring tasks
 *
 * Logic:
 * - For each recurring task, find the last generated task
 * - Generate all missing occurrences from the day after the last task up to the buffer date:
 *   - Daily: 30 days from today (30 occurrences)
 *   - Weekly: 12 weeks from today (12 occurrences)
 *   - Monthly: 12 months from today (12 occurrences)
 * - Only generate tasks that don't already exist
 *
 * This ensures users always see a good buffer:
 * - Daily: 30 tasks (30 days)
 * - Weekly: 12 tasks (12 weeks = ~3 months)
 * - Monthly: 12 tasks (12 months = 1 year)
 */
export async function GET(req: Request) {
  // Vercel Cron automatically sends CRON_SECRET as Authorization header
  // If CRON_SECRET is set in Vercel, it will be: "Bearer <CRON_SECRET>"
  // For manual testing, you can also send this header
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it (Vercel will send it automatically)
  // If not set, allow access (for development/testing)
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Get all active recurring tasks
  // Note: In Prisma/MongoDB, null handling can be tricky
  // We'll fetch all and filter in code to be safe
  const allRecurringTasks = await prisma.recurringTask.findMany({
    include: {
      user: {
        select: {
          id: true,
          preferredTimeZone: true,
        },
      },
    },
  });

  // Filter to only active tasks (endAt is null or in the future)
  const recurringTasks = allRecurringTasks.filter(
    (task) => task.endAt === null || task.endAt >= now,
  );

  const results = {
    processed: 0,
    generated: 0,
    errors: [] as string[],
  };

  for (const recurringTask of recurringTasks) {
    try {
      results.processed++;

      const userTimeZone = recurringTask.user.preferredTimeZone ?? 'UTC';

      // Find the last generated task for this recurring task
      const lastTask = await prisma.task.findFirst({
        where: {
          userId: recurringTask.userId,
          sourceRecurringTaskId: recurringTask.id,
        },
        orderBy: {
          startAt: 'desc',
        },
      });

      // Calculate the next occurrence based on recurrence type
      // Helper: Get base date (last task or start date)
      const baseDate = lastTask?.startAt
        ? new Date(lastTask.startAt)
        : (recurringTask.startAt ?? new Date());

      const nextOccurrenceDate = findNextOccurrence({
        recurrenceType: recurringTask.recurrenceType,
        baseDate,
        timesOfDay: recurringTask.timesOfDay,
        timeZone: userTimeZone,
        daysOfWeek:
          recurringTask.daysOfWeek.length > 0
            ? recurringTask.daysOfWeek
            : undefined,
        monthDays:
          recurringTask.monthDays.length > 0
            ? recurringTask.monthDays
            : undefined,
        lastTaskDate: lastTask?.startAt ?? undefined,
      });

      if (!nextOccurrenceDate) {
        continue;
      }

      // Generate all missing occurrences from last task to buffer date
      // Daily: 30 days from today
      // Weekly: 12 weeks from today
      // Monthly: 12 months from today
      let datesToGenerate: Date[] = [];

      if (recurringTask.recurrenceType === 'DAILY' && lastTask?.startAt) {
        // Daily: Generate all missing days from day after last task to buffer date
        // Use date keys to avoid timezone conversion issues
        const lastTaskDateKey = toDateKey(lastTask.startAt, userTimeZone);
        const bufferDate = new Date(now.getTime() + 29 * MS_PER_DAY); // 30 days from today (including today)
        const bufferDateKey = toDateKey(bufferDate, userTimeZone);

        // Parse date keys (YYYY-MM-DD format)
        const [lastYear, lastMonth, lastDay] = lastTaskDateKey
          .split('-')
          .map(Number);
        const [bufferYear, bufferMonth, bufferDay] = bufferDateKey
          .split('-')
          .map(Number);

        // Generate all missing days from day after last task to buffer date
        let currentYear = lastYear;
        let currentMonth = lastMonth;
        let currentDay = lastDay + 1; // Start from day after last task

        // Handle day overflow
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        if (currentDay > daysInMonth) {
          currentDay = 1;
          currentMonth += 1;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear += 1;
          }
        }

        // Generate dates until we reach buffer date
        while (
          currentYear < bufferYear ||
          (currentYear === bufferYear &&
            (currentMonth < bufferMonth ||
              (currentMonth === bufferMonth && currentDay <= bufferDay)))
        ) {
          // Create a date at noon UTC for this day, then use startOfDay to get midnight in user's timezone
          const dateAtNoon = new Date(
            Date.UTC(currentYear, currentMonth - 1, currentDay, 12, 0, 0),
          );
          const dateStart = startOfDay(dateAtNoon, userTimeZone);
          datesToGenerate.push(dateStart);

          // Move to next day
          currentDay += 1;
          const daysInCurrentMonth = new Date(
            currentYear,
            currentMonth,
            0,
          ).getDate();
          if (currentDay > daysInCurrentMonth) {
            currentDay = 1;
            currentMonth += 1;
            if (currentMonth > 12) {
              currentMonth = 1;
              currentYear += 1;
            }
          }
        }
      } else if (
        (recurringTask.recurrenceType === 'WEEKLY' ||
          recurringTask.recurrenceType === 'MONTHLY') &&
        lastTask?.startAt
      ) {
        // Weekly/Monthly: Generate all missing occurrences from day after last task to buffer date
        // Calculate buffer date
        // Note: For 12 occurrences, we want to generate up to the end of the 12th period
        // So for weekly: 11 weeks from today (to get weeks 1-12)
        // For monthly: 11 months from today (to get months 1-12)
        let bufferDate: Date;
        if (recurringTask.recurrenceType === 'WEEKLY') {
          // 11 weeks from today = end of week 12 (12 total weeks)
          bufferDate = new Date(
            now.getTime() +
              (RECURRENCE_CONFIG.weekly.maxWeeksToSearch - 1) *
                DAYS_IN_WEEK *
                MS_PER_DAY,
          );
        } else {
          // 11 months from today = end of month 12 (12 total months)
          const bufferDateParts = new Date(now);
          bufferDateParts.setMonth(
            bufferDateParts.getMonth() +
              RECURRENCE_CONFIG.monthly.maxMonthsToSearch -
              1,
          );
          bufferDate = bufferDateParts;
        }

        // Start from day after last task
        const startDate = new Date(lastTask.startAt);
        startDate.setDate(startDate.getDate() + 1);
        const startDateStartOfDay = startOfDay(startDate, userTimeZone);

        // Generate all occurrences starting from day after last task
        // Limit to buffer window: 12 occurrences for weekly, 12 for monthly
        const maxOccurrences =
          recurringTask.recurrenceType === 'WEEKLY' ? 12 : 12;

        const allOccurrences = generateOccurrences({
          recurrence:
            recurringTask.recurrenceType === 'WEEKLY' ? 'weekly' : 'monthly',
          startDate: startDateStartOfDay,
          recurrenceDays: recurringTask.daysOfWeek,
          recurrenceMonthDays: recurringTask.monthDays,
          timesOfDay: recurringTask.timesOfDay,
          timeZone: userTimeZone,
          maxOccurrences,
        });

        // Filter to only include occurrences up to buffer date
        // Note: allOccurrences already have times merged, so we compare the date part
        const bufferDateKey = toDateKey(bufferDate, userTimeZone);
        datesToGenerate = allOccurrences
          .filter((occ) => {
            const occKey = toDateKey(occ, userTimeZone);
            return occKey <= bufferDateKey;
          })
          .map((occ) => startOfDay(occ, userTimeZone)); // Convert to start of day for consistency with daily logic
      } else {
        // Fallback: Just use the next occurrence date (for tasks with no last task)
        const nextDate = startOfDay(nextOccurrenceDate, userTimeZone);
        datesToGenerate = [nextDate];
      }

      // Check which dates already have tasks and only generate missing ones
      const tasksToCreate: ReturnType<typeof createTaskDataFromRecurring>[] =
        [];
      for (const date of datesToGenerate) {
        // date is already startOfDay from the generation logic above
        const dayStart = date;
        const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);

        // Check if any task exists for this date
        const existingTaskForDate = await prisma.task.findFirst({
          where: {
            userId: recurringTask.userId,
            sourceRecurringTaskId: recurringTask.id,
            startAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        });

        if (existingTaskForDate) {
          continue;
        }

        // Generate tasks for all timesOfDay for this date
        for (const time of recurringTask.timesOfDay) {
          const occurrence = mergeDateAndTime(dayStart, time, userTimeZone);
          tasksToCreate.push(
            createTaskDataFromRecurring(
              {
                userId: recurringTask.userId,
                title: recurringTask.title,
                description: recurringTask.description,
                category: recurringTask.category,
                xpValue: recurringTask.xpValue,
                recurringTaskId: recurringTask.id,
              },
              occurrence,
            ),
          );
        }
      }

      if (tasksToCreate.length > 0) {
        await prisma.task.createMany({
          data: tasksToCreate,
        });

        // Update nextOccurrence to the latest generated task
        const latestTask = tasksToCreate[tasksToCreate.length - 1];
        await prisma.recurringTask.update({
          where: { id: recurringTask.id },
          data: { nextOccurrence: latestTask.startAt },
        });

        results.generated += tasksToCreate.length;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`RecurringTask ${recurringTask.id}: ${errorMessage}`);
      console.error(
        `Error processing recurring task ${recurringTask.id}:`,
        error,
      );
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
