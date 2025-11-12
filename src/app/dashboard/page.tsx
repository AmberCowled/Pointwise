import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';
import DashboardPageClient from './DashboardPageClient';
import { type DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const displayName =
    session.user?.name?.split(' ')[0] ?? session.user?.email ?? 'Adventurer';

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const userRecord = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, xp: true },
      })
    : null;

  if (!userRecord) {
    redirect('/');
  }

  const totalXp = userRecord.xp ?? 0;
  const { level, progress, xpIntoLevel, xpToNext } = levelFromXp(totalXp);
  const xpRemaining = Math.max(0, xpToNext - xpIntoLevel);

  const profile = {
    level,
    totalXp,
    xpIntoLevel,
    xpRemaining,
    progress,
    streak: 7,
    title: 'Momentum Builder',
  };

  const tasksFromDb = await prisma.task.findMany({
    where: {
      userId: userRecord.id,
    },
    orderBy: [{ startAt: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
    take: 500,
  });

  const tasks: DashboardTask[] = tasksFromDb.map((task) => ({
    id: task.id,
    title: task.title,
    context: task.description,
    category: task.category,
    xp: task.xpValue ?? 0,
    status: task.completedAt ? 'completed' : 'scheduled',
    completed: Boolean(task.completedAt),
    startAt: task.startAt ? task.startAt.toISOString() : null,
    dueAt: task.dueAt ? task.dueAt.toISOString() : null,
  }));

  const stats = [
    {
      label: 'Weekly Focus Time',
      value: '12.5h',
      change: '+2.4h vs last week',
    },
    { label: 'Tasks Completed', value: '18', change: '+6 this week' },
    { label: 'XP Earned', value: '860', change: '+18% growth' },
    { label: 'Consistency', value: '87%', change: '5-day rolling average' },
  ];

  const achievements = [
    {
      id: 'ach-1',
      title: 'Streak Keeper',
      description: 'Maintain a 7-day productivity streak',
      progress: 1,
    },
    {
      id: 'ach-2',
      title: 'XP Collector',
      description: 'Earn 1,000 XP in a single week',
      progress: 0.68,
    },
    {
      id: 'ach-3',
      title: 'Deep Work Devotee',
      description: 'Log 15 hours of deep work sessions',
      progress: 0.42,
    },
  ];

  const initials =
    session.user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'PW';

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <DashboardPageClient
        today={today}
        displayName={displayName}
        initials={initials}
        userName={session.user?.name ?? 'Pointwise User'}
        userEmail={session.user?.email ?? 'No email on file'}
        tasks={tasks}
        stats={stats}
        achievements={achievements}
        profile={profile}
      />
    </div>
  );
}
