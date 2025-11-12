'use client';

import { useState } from 'react';
import DashboardNavbar from '@pointwise/app/components/dashboard/DashboardNavbar';
import TaskList, {
  type DashboardTask,
} from '@pointwise/app/components/dashboard/TaskList';
import { levelFromXp } from '@pointwise/lib/xp';

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
  const [taskItems, setTaskItems] = useState<DashboardTask[]>(tasks);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const progressPercent = Math.min(100, Math.round(xpState.progress * 100));

  const handleComplete = async (task: DashboardTask) => {
    if (task.completed || completingId) return;
    setCompletingId(task.id);
    try {
      const response = await fetch('/api/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: task.xp }),
      });

      if (!response.ok) {
        throw new Error('XP award failed');
      }

      const payload: Partial<ReturnType<typeof levelFromXp> & { xp: number }> =
        await response.json().catch(() => ({}));

      setTaskItems((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, completed: true } : item,
        ),
      );

      setXpState((prev) => {
        const xpFromServer =
          typeof payload.xp === 'number' && Number.isFinite(payload.xp)
            ? Math.max(0, Math.floor(payload.xp))
            : prev.totalXp + task.xp;
        const { level, progress, xpIntoLevel, xpToNext } =
          levelFromXp(xpFromServer);

        return {
          level,
          totalXp: xpFromServer,
          xpIntoLevel,
          xpRemaining: Math.max(0, xpToNext - xpIntoLevel),
          progress,
        };
      });
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {today}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="max-w-xl text-sm text-zinc-400 sm:text-base">
              Stay in flow, level up your productivity, and keep your streak
              alive. Here&apos;s what&apos;s lined up for today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/10">
              Add Quick Task
            </button>
            <button className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30">
              Start Focus Session
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Today&apos;s plan
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Priority task list
                  </h2>
                </div>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white">
                  View all
                </button>
              </div>
              <TaskList
                tasks={taskItems}
                onComplete={handleComplete}
                completingTaskId={completingId}
              />
            </div>
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
