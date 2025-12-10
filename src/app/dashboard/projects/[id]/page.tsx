import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';
import Dashboard from '@pointwise/app/dashboard/Dashboard';
import { ProjectProvider } from '@pointwise/contexts/ProjectContext';
import { type DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { buildAnalyticsSnapshot } from '@pointwise/lib/analytics';
import {
  DateTimeDefaults,
  formatDateLabel,
  startOfDay,
} from '@pointwise/lib/datetime';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const { id: projectId } = await params;

  const headerStore = await headers();
  const cookieStore = await cookies();

  const displayName =
    session.user?.name?.split(' ')[0] ?? session.user?.email ?? 'Adventurer';

  const userRecord = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          preferredLocale: true,
          preferredTimeZone: true,
        },
      })
    : null;

  if (!userRecord) {
    redirect('/');
  }

  // Fetch the project and verify access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    notFound();
  }

  // Check if user has access to this project
  const hasAccess =
    project.adminUserIds.includes(userRecord.id) ||
    project.projectUserIds.includes(userRecord.id) ||
    project.viewerUserIds.includes(userRecord.id) ||
    project.visibility === 'PUBLIC';

  if (!hasAccess) {
    redirect('/dashboard');
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

  const profile = {
    title: 'Momentum Builder',
  };

  // Fetch tasks for THIS project only
  const tasksFromDb = await prisma.task.findMany({
    where: {
      projectId: projectId,
    },
    orderBy: [{ startDate: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
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
  });

  const tasks: DashboardTask[] = tasksFromDb.map((task) => {
    // Parse recurrencePattern from JSON if it exists
    let recurrencePattern: DashboardTask['recurrencePattern'] = undefined;
    if (task.recurrencePattern) {
      try {
        const parsed =
          typeof task.recurrencePattern === 'string'
            ? JSON.parse(task.recurrencePattern)
            : task.recurrencePattern;
        recurrencePattern = parsed;
      } catch {
        // Invalid JSON, leave as undefined
      }
    }

    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      context: task.description,
      category: task.category,
      xp: task.xpValue ?? 0,
      status:
        (task.status as DashboardTask['status']) ||
        (task.completedAt ? 'completed' : 'scheduled'),
      completed: Boolean(task.completedAt),
      startDate: task.startDate
        ? task.startDate.toISOString().split('T')[0]
        : null,
      startTime: task.startTime ?? null,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      dueTime: task.dueTime ?? null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,

      // Assignment (for Phase 3)
      assignedUserIds: task.assignedUserIds,
      acceptedUserIds: task.acceptedUserIds,

      // Recurring pattern
      recurrencePattern,

      // Recurring instance tracking
      isRecurringInstance: task.isRecurringInstance ?? false,
      sourceRecurringTaskId: task.sourceRecurringTaskId,
      recurrenceInstanceKey: task.recurrenceInstanceKey ?? null,
      isEditedInstance: task.isEditedInstance ?? false,
      editedInstanceKeys: task.editedInstanceKeys,
    };
  });

  const initialAnalytics = buildAnalyticsSnapshot(tasks, '7d', locale, timeZone);

  const initials =
    session.user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'PW';

  // Serialize project for client
  // Note: Project schema doesn't have createdBy, using first admin as fallback
  const serializedProject = {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    visibility: project.visibility,
    adminUserIds: project.adminUserIds,
    projectUserIds: project.projectUserIds,
    viewerUserIds: project.viewerUserIds ?? [],
    createdBy: project.adminUserIds[0] ?? '', // First admin is typically creator
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  // Simple project info for Dashboard header
  const projectInfo = {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <ProjectProvider
        initialProject={serializedProject}
        initialProjects={[serializedProject]}
        userId={userRecord.id}
      >
        <Dashboard
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
          project={projectInfo}
        />
      </ProjectProvider>
    </div>
  );
}

