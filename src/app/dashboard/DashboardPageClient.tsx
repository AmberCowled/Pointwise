'use client';

import { useState } from 'react';
import Navbar from '@pointwise/app/components/dashboard/Navbar';
import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import TaskCreateModal, {
  type TaskFormValues,
} from '@pointwise/app/components/dashboard/TaskCreateModal';
import TaskManageModal from '@pointwise/app/components/dashboard/TaskManageModal';
import AnalyticsSection from '@pointwise/app/components/dashboard/analytics/AnalyticsSection';
import { startOfDay } from '@pointwise/lib/datetime';
import { mergeTasks } from '@pointwise/lib/tasks';
import TaskBoard from '@pointwise/app/components/dashboard/task-board/TaskBoard';
import { useTaskFilters } from '@pointwise/hooks/useTaskFilters';

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

  const {
    scheduledTasks,
    optionalTasks,
    overdueTasks,
    selectedDateLabel,
    selectedDateInputValue,
  } = useTaskFilters(taskItems, selectedDate);

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
          <TaskBoard
            scheduledTasks={scheduledTasks}
            optionalTasks={optionalTasks}
            overdueTasks={overdueTasks}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateInputValue={selectedDateInputValue}
            onSelectedDateChange={setSelectedDate}
            onCreateTask={() => openCreateModal('create')}
            onTaskClick={handleTaskClick}
            onCompleteTask={handleComplete}
            completingTaskId={completingId}
          />
        </main>

        <div className="mt-12">
          <AnalyticsSection tasks={taskItems} />
        </div>
      </div>
    </>
  );
}
