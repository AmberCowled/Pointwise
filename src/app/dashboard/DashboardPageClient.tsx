'use client';

import { useMemo, useState } from 'react';
import DashboardNavbar from '@pointwise/app/components/dashboard/DashboardNavbar';
import TaskList, {
  type DashboardTask,
} from '@pointwise/app/components/dashboard/TaskList';
import TaskCreateModal, {
  type TaskFormValues,
} from '@pointwise/app/components/dashboard/TaskCreateModal';

type Stat = { label: string; value: string; change: string };
type Achievement = {
  id: string;
  title: string;
  description: string;
  progress: number;
};

type ProfileSnapshot = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpRemaining: number;
  progress: number;
  streak: number;
  title: string;
};

type DashboardPageClientProps = {
  today: string;
  displayName: string;
  initials: string;
  userName: string;
  userEmail: string;
  tasks: DashboardTask[];
  stats: Stat[];
  achievements: Achievement[];
  profile: ProfileSnapshot;
};

export default function DashboardPageClient({
  today,
  displayName,
  initials,
  userName,
  userEmail,
  tasks,
  stats,
  achievements,
  profile,
}: DashboardPageClientProps) {
  const [xpState, setXpState] = useState({
    level: profile.level,
    totalXp: profile.totalXp,
    xpIntoLevel: profile.xpIntoLevel,
    xpRemaining: profile.xpRemaining,
    progress: profile.progress,
  });
  const [taskItems, setTaskItems] = useState<DashboardTask[]>(
    Array.isArray(tasks) ? tasks : [],
  );
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (values: TaskFormValues) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          category: values.category,
          xpValue: values.xpValue,
          context: values.context,
          startAt: values.startAt ?? null,
          dueAt: values.dueAt ?? null,
          recurrence: values.recurrence ?? 'none',
          recurrenceDays: values.recurrenceDays ?? [],
          recurrenceMonthDays: values.recurrenceMonthDays ?? [],
          timesOfDay: (values.timesOfDay ?? []).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Task creation failed');
      }

      const payload = await response.json();
      if (Array.isArray(payload.tasks)) {
        setTaskItems((prev) => mergeTasks(prev, payload.tasks));
      }

      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayKey = dayStart.getTime();
    return taskItems.filter((task) => {
      if (task.completed) return false;
      const rawStart = toDate(task.startAt);
      const rawEnd = toDate(task.dueAt);
      const start = rawStart
        ? startOfDay(rawStart)
        : rawEnd
          ? startOfDay(rawEnd)
          : null;
      const end = rawEnd
        ? startOfDay(rawEnd)
        : rawStart && !task.completed
          ? null
          : start;
      if (!start && !end) return false;
      const startTime = start?.getTime() ?? Number.NEGATIVE_INFINITY;
      const endTime = end ? end.getTime() : Number.POSITIVE_INFINITY;
      return startTime <= dayKey && endTime >= dayKey;
    });
  }, [selectedDate, taskItems]);

  const optionalTasks = useMemo(
    () =>
      taskItems.filter(
        (task) => !task.completed && !task.startAt && !task.dueAt,
      ),
    [taskItems],
  );

  const overdueTasks = useMemo(() => {
    const now = Date.now();
    return taskItems
      .filter((task) => {
        if (task.completed) return false;
        const due = toDate(task.dueAt);
        if (!due) return false;
        return due.getTime() < now;
      })
      .sort((a, b) => {
        const aDue = toDate(a.dueAt)!.getTime();
        const bDue = toDate(b.dueAt)!.getTime();
        return aDue - bDue;
      });
  }, [taskItems]);

  const selectedDateLabel = useMemo(() => {
    return formatDateLabel(selectedDate);
  }, [selectedDate]);

  const selectedDateInputValue = useMemo(() => {
    return toDateKey(selectedDate);
  }, [selectedDate]);

  const handleComplete = async (task: DashboardTask) => {
    if (task.completed || completingId) return;
    setCompletingId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Task completion failed');
      }

      const payload = await response.json();

      if (payload.task) {
        setTaskItems((prev) => mergeTasks(prev, [payload.task]));
      }

      if (payload.xp) {
        const xpSnapshot = payload.xp;
        const xpIntoLevel = xpSnapshot.xpIntoLevel ?? 0;
        const xpToNext = xpSnapshot.xpToNext ?? 0;
        setXpState({
          level: xpSnapshot.level,
          totalXp: xpSnapshot.totalXp,
          xpIntoLevel,
          xpRemaining: Math.max(0, xpToNext - xpIntoLevel),
          progress: xpSnapshot.progress ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to complete task', error);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <>
      <DashboardNavbar
        initials={initials}
        level={xpState.level}
        xpRemaining={xpState.xpRemaining}
        progress={xpState.progress}
      />

      <TaskCreateModal
        key={isCreateOpen ? selectedDateInputValue : 'task-modal'}
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultDate={selectedDate}
        onSubmit={handleCreateTask}
        loading={isCreating}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {today}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {displayName}
            </h1>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Overview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Task list</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white">
                    View all
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    Create Task
                  </button>
                  <button className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                    Start Focus Session
                  </button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
                  {selectedDateLabel}
                </div>
                <div className="inline-flex items-center gap-1">
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
                  >
                    ⟨ Prev
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate(startOfDay(new Date()))}
                  >
                    Today
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                    onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
                  >
                    Next ⟩
                  </button>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
                  <span className="text-xs text-zinc-400">Jump to</span>
                  <input
                    className="cursor-pointer border-0 bg-transparent text-sm text-zinc-100 focus:outline-none"
                    type="date"
                    value={selectedDateInputValue}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) return;
                      const next = new Date(value);
                      if (!Number.isNaN(next.getTime())) {
                        setSelectedDate(startOfDay(next));
                      }
                    }}
                  />
                </label>
              </div>
              {filteredTasks.length > 0 ? (
                <TaskList
                  tasks={filteredTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
                  No tasks scheduled for{' '}
                  <span className="font-medium text-zinc-200">
                    {selectedDateLabel}
                  </span>
                  . Add one with{' '}
                  <span className="font-medium text-zinc-200">Create Task</span>{' '}
                  or set up a recurring routine.
                </div>
              )}
            </div>

            {overdueTasks.length > 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-400/70">
                      Needs attention
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-rose-200">
                      Overdue tasks
                    </h2>
                  </div>
                </div>
                <TaskList
                  tasks={overdueTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                />
              </div>
            ) : null}

            {optionalTasks.length > 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Backlog
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Optional tasks
                    </h2>
                  </div>
                </div>
                <TaskList
                  tasks={optionalTasks}
                  onComplete={handleComplete}
                  completingTaskId={completingId}
                />
              </div>
            ) : null}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-lg font-semibold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Profile</p>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    {userName}
                  </h2>
                  <p className="text-sm text-zinc-500">{userEmail}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Level
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-100">
                    {xpState.level}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Title
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-100">
                    {profile.title}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Streak
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-100">
                    {profile.streak} days
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">
                    Total XP
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-100">
                    {xpState.totalXp.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">
                  This week&apos;s stats
                </h2>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white">
                  Insights
                </button>
              </div>
              <ul className="mt-4 grid gap-3">
                {stats.map((stat) => (
                  <li
                    key={stat.label}
                    className="rounded-2xl border border-white/5 bg-zinc-950/40 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {stat.label}
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-semibold text-zinc-100">
                        {stat.value}
                      </span>
                      <span className="text-xs text-emerald-300">
                        {stat.change}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Achievements
                </h2>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white">
                  View all badges
                </button>
              </div>
              <ul className="mt-4 space-y-4">
                {achievements.map((achievement) => (
                  <li
                    key={achievement.id}
                    className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {achievement.description}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-indigo-300">
                        {Math.round(achievement.progress * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500"
                        style={{
                          width: `${Math.min(100, achievement.progress * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </>
  );
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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function formatDateLabel(date: Date) {
  const utcSafe = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return DATE_LABEL_FORMATTER.format(utcSafe);
}

function toDate(input?: string | Date | null) {
  if (!input) return null;
  const value = input instanceof Date ? input : new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

function mergeTasks(existing: DashboardTask[], incoming: DashboardTask[]) {
  const map = new Map<string, DashboardTask>();
  for (const task of existing) {
    map.set(task.id, task);
  }
  for (const task of incoming) {
    map.set(task.id, task);
  }
  const result = Array.from(map.values());
  result.sort((a, b) => {
    const aTime = getTaskSortTime(a);
    const bTime = getTaskSortTime(b);
    const aFinite = Number.isFinite(aTime);
    const bFinite = Number.isFinite(bTime);
    if (!aFinite && !bFinite) return 0;
    if (!aFinite) return 1;
    if (!bFinite) return -1;
    return aTime - bTime;
  });
  return result;
}

function getTaskSortTime(task: DashboardTask) {
  const start = toDate(task.startAt);
  if (start) return start.getTime();
  const due = toDate(task.dueAt);
  if (due) return due.getTime();
  return Number.POSITIVE_INFINITY;
}
