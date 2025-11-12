'use client';

import { useMemo, useState } from 'react';
import Navbar from '@pointwise/app/components/dashboard/Navbar';
import TaskList, {
  type DashboardTask,
} from '@pointwise/app/components/dashboard/TaskList';
import TaskCreateModal, {
  type TaskFormValues,
} from '@pointwise/app/components/dashboard/TaskCreateModal';
import TaskManageModal from '@pointwise/app/components/dashboard/TaskManageModal';
import AnalyticsSection from '@pointwise/app/components/dashboard/analytics/AnalyticsSection';
import {
  addDays,
  formatDateLabel,
  startOfDay,
  toDate,
  toDateKey,
} from '@pointwise/lib/datetime';
import { mergeTasks } from '@pointwise/lib/tasks';

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
  tasks: DashboardTask[];
  profile: ProfileSnapshot;
};

export default function DashboardPageClient({
  today,
  displayName,
  initials,
  tasks,
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
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorTask, setEditorTask] = useState<DashboardTask | null>(null);
  const [manageTask, setManageTask] = useState<DashboardTask | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleSubmitTask = async (values: TaskFormValues) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      if (editorMode === 'edit' && values.id) {
        const response = await fetch(`/api/tasks/${values.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            category: values.category,
            xpValue: values.xpValue,
            context: values.context,
            startAt: values.startAt,
            dueAt: values.dueAt,
          }),
        });

        if (!response.ok) throw new Error('Task update failed');

        const payload = await response.json();
        if (payload.task) {
          setTaskItems((prev) => mergeTasks(prev, [payload.task]));
          setEditorTask(payload.task);
        }
      } else {
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
          const errorPayload = await response.json().catch(() => null);
          const message =
            typeof errorPayload === 'object' &&
            errorPayload &&
            'error' in errorPayload
              ? String((errorPayload as Record<string, unknown>).error)
              : 'Task creation failed';
          throw new Error(message);
        }

        const payload = await response.json();
        if (Array.isArray(payload.tasks)) {
          setTaskItems((prev) => mergeTasks(prev, payload.tasks));
        }
      }

      setIsCreateOpen(false);
      setEditorTask(null);
      setManageTask(null);
      setIsManageOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create task';
      console.error('Failed to create task', error);
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };
  const openCreateModal = (
    mode: 'create' | 'edit',
    task: DashboardTask | null = null,
  ) => {
    setEditorMode(mode);
    setEditorTask(task);
    setEditorVersion((v) => v + 1);
    setCreateError(null);
    setIsCreateOpen(true);
  };
  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateError(null);
  };
  const handleTaskClick = (task: DashboardTask) => {
    setManageTask(task);
    setIsManageOpen(true);
  };

  const handleEditTask = (task: DashboardTask) => {
    setIsManageOpen(false);
    openCreateModal('edit', task);
  };

  const handleDeleteTask = async (
    task: DashboardTask,
    scope: 'single' | 'all',
  ) => {
    try {
      const url =
        scope === 'all'
          ? `/api/tasks/${task.id}?scope=series`
          : `/api/tasks/${task.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Task deletion failed');
      }
      const payload = await response.json();
      const deletedIds: string[] = payload.deletedIds ?? [task.id];
      setTaskItems((prev) =>
        prev.filter((item) => !deletedIds.includes(item.id)),
      );
      setIsManageOpen(false);
      setManageTask(null);
    } catch (error) {
      console.error('Failed to delete task', error);
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
      <Navbar
        initials={initials}
        level={xpState.level}
        xpRemaining={xpState.xpRemaining}
        progress={xpState.progress}
      />

      <TaskCreateModal
        key={`task-modal-${editorMode}-${editorTask?.id ?? 'new'}-${editorVersion}`}
        open={isCreateOpen}
        onClose={closeCreateModal}
        defaultDate={selectedDate}
        onSubmit={handleSubmitTask}
        loading={isCreating}
        mode={editorMode}
        task={editorTask}
        errorMessage={createError}
      />
      <TaskManageModal
        open={isManageOpen}
        task={manageTask}
        onClose={() => {
          setIsManageOpen(false);
          setManageTask(null);
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onComplete={handleComplete}
        isCompleting={Boolean(completingId && manageTask?.id === completingId)}
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

        <main className="flex-1 space-y-6">
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
                  <button
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
                    onClick={() => openCreateModal('create')}
                  >
                    Create Task
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
                  onTaskClick={handleTaskClick}
                />
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
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
                  onTaskClick={handleTaskClick}
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
                  onTaskClick={handleTaskClick}
                />
              </div>
            ) : null}
          </section>
        </main>

        <AnalyticsSection tasks={taskItems} />
      </div>
    </>
  );
}
