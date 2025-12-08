import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';
import { ProjectsOverview } from '@pointwise/app/components/dashboard/ProjectsOverview';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import {
  DateTimeDefaults,
  formatDateLabel,
  startOfDay,
} from '@pointwise/lib/datetime';
import { levelFromXp } from '@pointwise/lib/xp';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

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

  // Get locale and timezone for date formatting
  const headerLocale =
    (await headers()).get('accept-language')?.split(',')[0]?.trim() ?? undefined;
  const cookieStore = await cookies();
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

  // Calculate XP and level
  const totalXp = userRecord.xp ?? 0;
  const { level, progress, xpIntoLevel, xpToNext } = levelFromXp(totalXp);
  const xpRemaining = Math.max(0, xpToNext - xpIntoLevel);

  // Fetch all projects user has access to (including public ones)
  const projects = await (prisma as any).project.findMany({
    where: {
      OR: [
        { adminUserIds: { has: userRecord.id } },
        { projectUserIds: { has: userRecord.id } },
        { viewerUserIds: { has: userRecord.id } },
        { visibility: 'PUBLIC' },
      ],
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  });

  // Get task counts for each project
  const taskCounts: Record<string, number> = {};
  
  for (const project of projects) {
    const count = await prisma.task.count({
      where: {
        projectId: project.id,
        completedAt: null, // Only count incomplete tasks
      } as any, // Type assertion needed due to Prisma type issues
    });
    taskCounts[project.id] = count;
  }

  const initials =
    session.user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'PW';

  // Serialize projects for client component
  const serializedProjects = projects.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    visibility: p.visibility,
    adminUserIds: p.adminUserIds,
    projectUserIds: p.projectUserIds,
    viewerUserIds: p.viewerUserIds ?? [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <ProjectsOverview
        projects={serializedProjects}
        userId={userRecord.id}
        displayName={displayName}
        initials={initials}
        taskCounts={taskCounts}
        today={today}
        level={level}
        xpRemaining={xpRemaining}
        progress={progress}
        xpIntoLevel={xpIntoLevel}
        xpToNext={xpToNext}
      />
    </div>
  );
}
