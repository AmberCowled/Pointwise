import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';

export async function POST(
  _req: Request,
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
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
        },
      });

      if (!task) {
        return { status: 404 as const };
      }

      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true, xp: true },
      });

      if (!user || user.id !== task.userId) {
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
      return NextResponse.json(
        { error: result.status === 404 ? 'Task not found' : 'Forbidden' },
        { status: result.status },
      );
    }

    return NextResponse.json(
      {
        task: serializeTask(result.task),
        xp: {
          totalXp: result.totalXp,
          ...result.xpSnapshot,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to complete task', error);
    return NextResponse.json(
      { error: 'Task completion failed' },
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
