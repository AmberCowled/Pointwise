import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';

type CreateTaskBody = {
  title: string;
  category: string;
  xpValue: number;
  context?: string;
  startAt?: string | null;
  dueAt?: string | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
};

const DEFAULT_RECURRING_WINDOW_DAYS = 35;
const DEFAULT_RECURRING_MONTHS = 3;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<CreateTaskBody>;

  const title = body.title?.trim();
  const category = body.category?.trim() ?? 'General';
  const xpValue = Number.isFinite(body.xpValue)
    ? Math.max(0, Math.floor(body.xpValue!))
    : 0;
  const description = body.context?.trim() ?? '';
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const dueAt = body.dueAt ? new Date(body.dueAt) : null;
  const recurrence = body.recurrence ?? 'none';
  const recurrenceDays = Array.isArray(body.recurrenceDays)
    ? body.recurrenceDays.filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6,
      )
    : [];
  const recurrenceMonthDays = Array.isArray(body.recurrenceMonthDays)
    ? body.recurrenceMonthDays.filter(
        (day) => Number.isInteger(day) && day >= 1 && day <= 31,
      )
    : [];
  const timesOfDay = Array.isArray(body.timesOfDay)
    ? body.timesOfDay.filter(
        (time) => typeof time === 'string' && time.length > 0,
      )
    : [];

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  if (startAt && Number.isNaN(startAt.getTime())) {
    return NextResponse.json(
      { error: 'Invalid startAt value' },
      { status: 400 },
    );
  }

  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: 'Invalid dueAt value' }, { status: 400 });
  }

  if (startAt && dueAt && startAt > dueAt) {
    return NextResponse.json(
      { error: 'Start date cannot be after due date' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tasksToReturn: Array<
    {
      id: string;
      title: string;
      category: string | null;
      xp: number;
      context: string | null;
      status: 'scheduled' | 'in-progress' | 'focus';
      startAt: string | null;
      dueAt: string | null;
      sourceRecurringTaskId: string | null;
    } & { completed?: boolean }
  > = [];

  if (recurrence === 'none') {
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        xpValue,
        startAt,
        dueAt,
      },
    });

    tasksToReturn.push(serializeTask(task));
  } else {
    const anchorDate = dueAt ?? startAt ?? new Date();
    const safeTimes = deriveTimesOfDay({ anchorDate, timesOfDay });
    const startDate = startAt ?? anchorDate;
    const occurrences = generateOccurrences({
      recurrence,
      startDate,
      recurrenceDays,
      recurrenceMonthDays,
      timesOfDay: safeTimes,
    });

    const recurringTask = await prisma.recurringTask.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        xpValue,
        startAt: startDate,
        recurrenceType: recurrence.toUpperCase() as
          | 'DAILY'
          | 'WEEKLY'
          | 'MONTHLY',
        timesOfDay: safeTimes,
        daysOfWeek: recurrenceDays,
        monthDays: recurrenceMonthDays,
        nextOccurrence: occurrences[0] ?? null,
      },
    });

    const createdTasks = [] as typeof tasksToReturn;
    for (const occurrence of occurrences) {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          title,
          description,
          category,
          xpValue,
          startAt: occurrence,
          dueAt: occurrence,
          sourceRecurringTaskId: recurringTask.id,
        },
      });
      createdTasks.push(serializeTask(task));
    }

    tasksToReturn.push(...createdTasks);
  }

  return NextResponse.json({ tasks: tasksToReturn }, { status: 201 });
}

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpValue: number;
  startAt: Date | null;
  dueAt: Date | null;
  completedAt?: Date | null;
  sourceRecurringTaskId?: string | null;
}): {
  id: string;
  title: string;
  context: string | null;
  category: string | null;
  xp: number;
  status: 'scheduled';
  completed?: boolean;
  startAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  sourceRecurringTaskId: string | null;
} {
  return {
    id: task.id,
    title: task.title,
    context: task.description,
    category: task.category,
    xp: task.xpValue,
    status: 'scheduled',
    completed: Boolean(task.completedAt),
    startAt: task.startAt ? task.startAt.toISOString() : null,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    sourceRecurringTaskId: task.sourceRecurringTaskId ?? null,
  };
}

type OccurrenceInput = {
  recurrence: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  recurrenceDays: number[];
  recurrenceMonthDays: number[];
  timesOfDay: string[];
};

function generateOccurrences({
  recurrence,
  startDate,
  recurrenceDays,
  recurrenceMonthDays,
  timesOfDay,
}: OccurrenceInput): Date[] {
  switch (recurrence) {
    case 'daily':
      return generateDailyOccurrences(startDate, timesOfDay);
    case 'weekly':
      return generateWeeklyOccurrences(startDate, recurrenceDays, timesOfDay);
    case 'monthly':
      return generateMonthlyOccurrences(
        startDate,
        recurrenceMonthDays,
        timesOfDay,
      );
    default:
      return [];
  }
}

function generateDailyOccurrences(
  startDate: Date,
  timesOfDay: string[],
): Date[] {
  const occurrences: Date[] = [];
  const base = startOfDay(startDate);
  for (let offset = 0; offset < DEFAULT_RECURRING_WINDOW_DAYS; offset += 1) {
    const currentDay = addDays(base, offset);
    for (const time of timesOfDay) {
      occurrences.push(mergeDateAndTime(currentDay, time));
    }
  }
  return occurrences;
}

function generateWeeklyOccurrences(
  startDate: Date,
  recurrenceDays: number[],
  timesOfDay: string[],
): Date[] {
  const occurrences: Date[] = [];
  const base = startOfDay(startDate);
  const daySet = new Set(
    recurrenceDays.length ? recurrenceDays : [base.getDay()],
  );
  for (let offset = 0; offset < DEFAULT_RECURRING_WINDOW_DAYS; offset += 1) {
    const currentDay = addDays(base, offset);
    if (!daySet.has(currentDay.getDay())) continue;
    for (const time of timesOfDay) {
      occurrences.push(mergeDateAndTime(currentDay, time));
    }
  }
  return occurrences;
}

function generateMonthlyOccurrences(
  startDate: Date,
  recurrenceMonthDays: number[],
  timesOfDay: string[],
): Date[] {
  const occurrences: Date[] = [];
  const base = startOfDay(startDate);
  const monthDays = recurrenceMonthDays.length
    ? recurrenceMonthDays
    : [base.getDate()];

  let current = new Date(base);
  for (
    let monthOffset = 0;
    monthOffset < DEFAULT_RECURRING_MONTHS;
    monthOffset += 1
  ) {
    const year = current.getFullYear();
    const month = current.getMonth();
    for (const day of monthDays) {
      const candidate = new Date(year, month, day);
      if (candidate < base) continue;
      for (const time of timesOfDay) {
        occurrences.push(mergeDateAndTime(candidate, time));
      }
    }
    current = new Date(year, month + 1, 1);
  }

  return occurrences;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return startOfDay(copy);
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

function mergeDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return new Date(date);
  }
  const merged = new Date(date);
  merged.setHours(hours, minutes, 0, 0);
  return merged;
}
