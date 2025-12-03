'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@pointwise/app/components/dashboard/navbar/Navbar';
import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import TaskCreateModal, {
  type TaskFormValues,
} from '@pointwise/app/components/dashboard/TaskCreateModal';
import TaskManageModal from '@pointwise/app/components/dashboard/TaskManageModal';
import AnalyticsSection from '@pointwise/app/components/dashboard/analytics/AnalyticsSection';
import {
  DateTimeDefaults,
  formatDateLabel,
  startOfDay,
  toDate,
} from '@pointwise/lib/datetime';
import { mergeTasks } from '@pointwise/lib/tasks';
import TaskBoard from '@pointwise/app/components/dashboard/task-board/TaskBoard';
import type { TaskBoardViewMode } from '@pointwise/app/components/dashboard/task-board/types';
import { useTaskFilters } from '@pointwise/hooks/useTaskFilters';
import type { AnalyticsSnapshot } from '@pointwise/lib/analytics';

type ProfileSnapshot = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNext: number;
  xpRemaining: number;
  progress: number;
  streak?: number; // Optional until streak calculation is implemented
  title: string;
};

type DashboardPageClientProps = {
  today: string;
  displayName: string;
  initials: string;
  tasks: DashboardTask[];
  profile: ProfileSnapshot;
  locale: string | null;
  timeZone: string | null;
  initialAnalytics: AnalyticsSnapshot;
  initialSelectedDateMs: number;
  initialNowMs: number;
};

export default function DashboardPageClient({
  today,
  displayName,
  initials,
  tasks,
  profile,
  locale,
  timeZone,
  initialAnalytics,
  initialSelectedDateMs,
  initialNowMs,
}: DashboardPageClientProps) {
  const [xpState, setXpState] = useState({
    level: profile.level,
    totalXp: profile.totalXp,
    xpIntoLevel: profile.xpIntoLevel,
    xpToNext: profile.xpToNext,
    xpRemaining: profile.xpRemaining,
    progress: profile.progress,
  });
  const [taskItems, setTaskItems] = useState<DashboardTask[]>(
    Array.isArray(tasks) ? tasks : [],
  );
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatSettings, setFormatSettings] = useState(() => ({
    locale: locale ?? DateTimeDefaults.locale,
    timeZone: timeZone ?? DateTimeDefaults.timeZone,
  }));
  const [displayToday, setDisplayToday] = useState(today);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(initialSelectedDateMs),
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorTask, setEditorTask] = useState<DashboardTask | null>(null);
  const [manageTask, setManageTask] = useState<DashboardTask | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);
  const [referenceTimestamp, setReferenceTimestamp] = useState(initialNowMs);
  const [viewMode, setViewMode] = useState<TaskBoardViewMode>('day');
  const persistedSettingsRef = useRef({
    locale: locale ?? DateTimeDefaults.locale,
    timeZone: timeZone ?? DateTimeDefaults.timeZone,
  });
  const syncingRef = useRef(false);
  const appliedTimeZoneRef = useRef<string | null>(null);
  const selectedDateRef = useRef<Date | null>(new Date(initialSelectedDateMs));

  const syncPreferences = useCallback(
    async (nextLocale: string, nextTimeZone: string) => {
      if (
        persistedSettingsRef.current.locale === nextLocale &&
        persistedSettingsRef.current.timeZone === nextTimeZone
      ) {
        return;
      }
      try {
        syncingRef.current = true;
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: nextLocale,
            timeZone: nextTimeZone,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }
        persistedSettingsRef.current = {
          locale: nextLocale,
          timeZone: nextTimeZone,
        };
      } catch (error) {
        console.error('Failed to update user preferences', error);
      } finally {
        syncingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    const nextLocale = locale ?? DateTimeDefaults.locale;
    const nextTimeZone = timeZone ?? DateTimeDefaults.timeZone;
    persistedSettingsRef.current = {
      locale: nextLocale,
      timeZone: nextTimeZone,
    };
    setFormatSettings((prev) => {
      if (prev.locale === nextLocale && prev.timeZone === nextTimeZone) {
        return prev;
      }
      return { locale: nextLocale, timeZone: nextTimeZone };
    });
  }, [locale, timeZone]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectPreferences = () => {
      const browserLocale =
        navigator.language || persistedSettingsRef.current.locale;
      const browserTimeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        persistedSettingsRef.current.timeZone;
      setFormatSettings((prev) => {
        if (
          prev.locale === browserLocale &&
          prev.timeZone === browserTimeZone
        ) {
          return prev;
        }
        return {
          locale: browserLocale,
          timeZone: browserTimeZone,
        };
      });
    };

    detectPreferences();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        detectPreferences();
      }
    };

    window.addEventListener('focus', detectPreferences);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', detectPreferences);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const currentStart = startOfDay(new Date(), formatSettings.timeZone);
    setDisplayToday(
      formatDateLabel(
        currentStart,
        formatSettings.locale,
        formatSettings.timeZone,
      ),
    );

    if (
      appliedTimeZoneRef.current !== formatSettings.timeZone ||
      !selectedDateRef.current
    ) {
      appliedTimeZoneRef.current = formatSettings.timeZone;
      setSelectedDate(currentStart);
      selectedDateRef.current = currentStart;
    }

    syncPreferences(formatSettings.locale, formatSettings.timeZone);
  }, [formatSettings, syncPreferences]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const handleSubmitTask = async (values: TaskFormValues) => {
    setIsCreating(true);
    setCreateError(null);

    const normalizeDateInput = (input?: string | null) => {
      if (!input) return null;
      const parsed = new Date(input);
      if (Number.isNaN(parsed.getTime())) return null;
      return parsed.toISOString();
    };

    const payloadStartAt = normalizeDateInput(values.startAt ?? null);
    const payloadDueAt = normalizeDateInput(values.dueAt ?? null);

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
            startAt: payloadStartAt,
            dueAt: payloadDueAt,
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const message =
            typeof errorPayload === 'object' &&
            errorPayload &&
            'error' in errorPayload
              ? String((errorPayload as Record<string, unknown>).error)
              : 'Task update failed';
          throw new Error(message);
        }

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
            startAt: payloadStartAt,
            dueAt: payloadDueAt,
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
      const fallback =
        editorMode === 'edit'
          ? 'Failed to update task'
          : 'Failed to create task';
      const message = error instanceof Error ? error.message : fallback;
      console.error(fallback, error);
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

  // Filter tasks by search query (case-insensitive, partial match)
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return taskItems;
    }

    const query = searchQuery.toLowerCase().trim();
    return taskItems.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(query) ?? false;
      const categoryMatch =
        task.category?.toLowerCase().includes(query) ?? false;
      const contextMatch = task.context?.toLowerCase().includes(query) ?? false;
      return titleMatch || categoryMatch || contextMatch;
    });
  }, [taskItems, searchQuery]);

  const {
    scheduledTasks,
    optionalTasks,
    overdueTasks,
    selectedDateLabel,
    selectedDateInputValue,
  } = useTaskFilters(
    filteredTasks,
    selectedDate,
    formatSettings.locale,
    formatSettings.timeZone,
    referenceTimestamp,
    viewMode,
  );

  // Calculate upcoming tasks (next 10 tasks after current day)
  // Exclude tasks that are already in the scheduled tasks list
  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date(), formatSettings.timeZone);
    const scheduledTaskIds = new Set(scheduledTasks.map((task) => task.id));
    return filteredTasks
      .filter((task) => {
        if (task.completed) return false;
        // Exclude tasks already in scheduled tasks
        if (scheduledTaskIds.has(task.id)) return false;
        const taskDate = toDate(task.dueAt) || toDate(task.startAt);
        if (!taskDate) return false;
        return taskDate > today;
      })
      .sort((a, b) => {
        const dateA = toDate(a.dueAt) || toDate(a.startAt);
        const dateB = toDate(b.dueAt) || toDate(b.startAt);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10); // Limit to next 10 tasks
  }, [filteredTasks, scheduledTasks, formatSettings.timeZone]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReferenceTimestamp(Date.now());
  }, []);

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
          xpToNext,
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
        streak={profile.streak}
        xpIntoLevel={xpState.xpIntoLevel}
        xpToNext={xpState.xpToNext}
        locale={formatSettings.locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        locale={formatSettings.locale}
        timeZone={formatSettings.timeZone}
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
        locale={formatSettings.locale}
        timeZone={formatSettings.timeZone}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {displayToday}
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
            upcomingTasks={upcomingTasks}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateInputValue={selectedDateInputValue}
            onSelectedDateChange={setSelectedDate}
            onCreateTask={() => openCreateModal('create')}
            searchQuery={searchQuery}
            onTaskClick={handleTaskClick}
            onCompleteTask={handleComplete}
            completingTaskId={completingId}
            locale={formatSettings.locale}
            timeZone={formatSettings.timeZone}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>

        <div className="mt-12">
          <AnalyticsSection
            tasks={taskItems}
            locale={formatSettings.locale}
            timeZone={formatSettings.timeZone}
            initialSnapshot={initialAnalytics}
          />
        </div>
      </div>
    </>
  );
}
