import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';
import DashboardPageClient from './DashboardPageClient';
import { type DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';
import { buildAnalyticsSnapshot } from '@pointwise/lib/analytics';
import {
  DateTimeDefaults,
  formatDateLabel,
  startOfDay,
} from '@pointwise/lib/datetime';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const headerStore = await headers();
  const cookieStore = await cookies();

  const displayName =
    session.user?.name?.split(' ')[0] ?? session.user?.email ?? 'Adventurer';

  const userRecord = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          xp: true,
          preferredLocale: true,
          preferredTimeZone: true,
        },
      })
    : null;

  if (!userRecord) {
    redirect('/');
  }

  const headerLocale =
    headerStore.get('accept-language')?.split(',')[0]?.trim() ?? undefined;
  const cookieLocale = cookieStore.get('pw-locale')?.value;
  const cookieTimeZone = cookieStore.get('pw-timezone')?.value;

  const locale =
    userRecord.preferredLocale ??
    cookieLocale ??
    headerLocale ??
    DateTimeDefaults.locale;
  const timeZone =
    userRecord.preferredTimeZone ?? cookieTimeZone ?? DateTimeDefaults.timeZone;

  const now = new Date();
  const todayStart = startOfDay(now, timeZone);
  const today = formatDateLabel(todayStart, locale, timeZone);

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
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    sourceRecurringTaskId: task.sourceRecurringTaskId,
  }));

  const initialAnalytics = buildAnalyticsSnapshot(
    tasks,
    '7d',
    locale,
    timeZone,
  );

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
        tasks={tasks}
        profile={profile}
        locale={locale}
        timeZone={timeZone}
        initialAnalytics={initialAnalytics}
        initialSelectedDateMs={todayStart.getTime()}
        initialNowMs={now.getTime()}
      />
    </div>
  );
}
