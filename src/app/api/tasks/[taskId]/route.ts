import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { parseUpdateTaskBody } from '@pointwise/lib/validation/tasks';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await params;
  if (!taskId) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsed = parseUpdateTaskBody(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status },
    );
  }
  const updates = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: {
          id: taskId,
          user: { email },
        },
      });
      if (!task) return null;

      const data: Record<string, unknown> = {};
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.category !== undefined) data.category = updates.category;
      if (updates.xpValue !== undefined) data.xpValue = updates.xpValue;
      if (updates.context !== undefined) data.description = updates.context;
      if ('startAt' in updates) data.startAt = updates.startAt ?? null;
      if ('dueAt' in updates) data.dueAt = updates.dueAt ?? null;

      if (Object.keys(data).length === 0) return task;

      return tx.task.update({
        where: { id: taskId },
        data,
      });
    });

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    console.error('Failed to update task', error);
    return NextResponse.json({ error: 'Task update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { taskId } = await params;
  if (!taskId) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  const scope = new URL(req.url).searchParams.get('scope') ?? 'single';

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: {
          id: taskId,
          user: { email },
        },
        select: {
          id: true,
          sourceRecurringTaskId: true,
        },
      });
      if (!task) return null;

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
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ deletedIds: result });
  } catch (error) {
    console.error('Failed to delete task', error);
    return NextResponse.json(
      { error: 'Task deletion failed' },
      { status: 500 },
    );
  }
}

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  xpValue: number | null;
  startAt: Date | null;
  dueAt: Date | null;
  completedAt: Date | null;
  sourceRecurringTaskId: string | null;
}) {
  return {
    id: task.id,
    title: task.title,
    context: task.description,
    category: task.category,
    xp: task.xpValue ?? 0,
    status: task.completedAt ? 'completed' : 'scheduled',
    completed: Boolean(task.completedAt),
    startAt: task.startAt ? task.startAt.toISOString() : null,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    sourceRecurringTaskId: task.sourceRecurringTaskId,
  };
}
