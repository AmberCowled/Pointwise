'use client';

import { useState, useMemo } from 'react';
import Navbar from '@pointwise/app/components/dashboard/navbar/Navbar';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import TaskCreateModal from '@pointwise/app/components/dashboard/tasks/TaskCreateModal';
import TaskManageModal from '@pointwise/app/components/dashboard/tasks/TaskManageModal';
import AnalyticsSection from '@pointwise/app/components/dashboard/analytics/AnalyticsSection';
import TaskBoard from '@pointwise/app/components/dashboard/task-board/TaskBoard';
import type { TaskBoardViewMode } from '@pointwise/app/components/dashboard/task-board/types';
import { useTaskFilters } from '@pointwise/hooks/useTaskFilters';
import { useUserPreferences } from '@pointwise/hooks/useUserPreferences';
import { useDateSettings } from '@pointwise/hooks/useDateSettings';
import { useXpState } from '@pointwise/hooks/useXpState';
import { useTaskModals } from '@pointwise/hooks/tasks/useTaskModals';
import { useTaskOperations } from '@pointwise/hooks/tasks/useTaskOperations';
import { useTaskSearch } from '@pointwise/hooks/tasks/useTaskSearch';
import { useUpcomingTasks } from '@pointwise/hooks/tasks/useUpcomingTasks';
import { useRecurringTaskInstances } from '@pointwise/hooks/tasks/useRecurringTaskInstances';
import type { AnalyticsSnapshot } from '@pointwise/lib/analytics';
import { useApi } from '@pointwise/lib/api';
import type { ProfileSnapshot } from '@pointwise/app/components/dashboard/types';

type DashboardProps = {
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
  // NEW: Project context
  project?: {
    id: string;
    name: string;
    description?: string;
  };
};

export default function Dashboard({
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
  project,
}: DashboardProps) {
  const [taskItems, setTaskItems] = useState<DashboardTask[]>(
    Array.isArray(tasks) ? tasks : [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const api = useApi();

  // Use XP state hook
  const { xpState, updateXpFromSnapshot } = useXpState({
    initialLevel: profile.level,
    initialTotalXp: profile.totalXp,
    initialXpIntoLevel: profile.xpIntoLevel,
    initialXpToNext: profile.xpToNext,
    initialXpRemaining: profile.xpRemaining,
    initialProgress: profile.progress,
  });

  // Use preference management hook
  const { locale: formatLocale, timeZone: formatTimeZone } = useUserPreferences({
    initialLocale: locale,
    initialTimeZone: timeZone,
    updatePreferences: api.user.updatePreferences,
    detectBrowserPreferences: true,
  });

  // Use date settings hook
  const {
    selectedDate,
    displayToday,
    setSelectedDate,
  } = useDateSettings({
    initialSelectedDate: new Date(initialSelectedDateMs),
    initialToday: today,
    locale: formatLocale,
    timeZone: formatTimeZone,
  });
  // Use modal management hook
  const {
    isCreateOpen,
    editorMode,
    editorTask,
    editScope,
    recurringTaskData,
    editorVersion,
    createError,
    isCreating,
    isEditingTask,
    isManageOpen,
    manageTask,
    openCreateModal,
    closeCreateModal,
    setCreateError,
    setIsCreating,
    openManageModal,
    closeManageModal,
    handleEditTask,
  } = useTaskModals();
  const [referenceTimestamp] = useState(initialNowMs);
  const [viewMode, setViewMode] = useState<TaskBoardViewMode>('day');

  // Use task operations hook
  const {
    handleSubmitTask,
    handleDeleteTask,
    handleCompleteWithLoading,
    completingId,
  } = useTaskOperations({
    createTask: api.tasks.create,
    updateTask: api.tasks.update,
    deleteTask: api.tasks.delete,
    completeTask: api.tasks.complete,
    setTaskItems,
    closeCreateModal,
    closeManageModal,
    setCreateError,
    setIsCreating,
    updateXpFromSnapshot,
    editorMode,
    editScope,
  });

  // Handle task click (open manage modal)
  const handleTaskClick = (task: DashboardTask) => {
    openManageModal(task);
  };

  // Use task search hook
  const { filteredTasks } = useTaskSearch({
    tasks: taskItems,
    searchQuery,
  });

  // Calculate date range for instance generation based on view mode
  const instanceDateRange = useMemo(() => {
    const baseStart = new Date(selectedDate);
    baseStart.setHours(0, 0, 0, 0);

    let rangeEnd: Date;
    if (viewMode === 'day') {
      rangeEnd = new Date(baseStart);
      rangeEnd.setDate(rangeEnd.getDate() + 1);
    } else if (viewMode === 'week') {
      rangeEnd = new Date(baseStart);
      rangeEnd.setDate(rangeEnd.getDate() + 7);
    } else {
      // month
      rangeEnd = new Date(baseStart);
      rangeEnd.setDate(rangeEnd.getDate() + 30);
    }

    return { start: baseStart, end: rangeEnd };
  }, [selectedDate, viewMode]);

  // Generate recurring task instances on-demand
  const tasksWithInstances = useRecurringTaskInstances({
    tasks: filteredTasks,
    dateRange: instanceDateRange,
    userTimeZone: formatTimeZone,
  });

  const {
    scheduledTasks,
    optionalTasks,
    overdueTasks,
    selectedDateLabel,
    selectedDateInputValue,
  } = useTaskFilters(
    tasksWithInstances,
    selectedDate,
    formatLocale,
    formatTimeZone,
    referenceTimestamp,
    viewMode,
  );

  // Use upcoming tasks hook
  const { upcomingTasks } = useUpcomingTasks({
    tasks: tasksWithInstances,
    scheduledTasks,
    timeZone: formatTimeZone,
  });


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
        locale={formatLocale}
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
        editScope={editorMode === 'edit' ? editScope : 'single'}
        recurringTaskData={recurringTaskData}
        errorMessage={createError}
        locale={formatLocale}
        timeZone={formatTimeZone}
      />
      <TaskManageModal
        open={isManageOpen}
        task={manageTask}
        onClose={closeManageModal}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onComplete={handleCompleteWithLoading}
        isCompleting={Boolean(completingId && manageTask?.id === completingId)}
        isEditing={isEditingTask}
        locale={formatLocale}
        timeZone={formatTimeZone}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {displayToday}
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                {viewMode === 'day' ? 'Today' : viewMode === 'week' ? 'This Week' : 'This Month'}
              </h1>
              <span className="text-base text-zinc-400">
                • {scheduledTasks.length} tasks
                {overdueTasks.length > 0 && ` • ${overdueTasks.length} overdue`}
              </span>
            </div>
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
            onCompleteTask={handleCompleteWithLoading}
            completingTaskId={completingId}
            locale={formatLocale}
            timeZone={formatTimeZone}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>

        <div className="mt-12">
          <AnalyticsSection
            tasks={taskItems}
            locale={formatLocale}
            timeZone={formatTimeZone}
            initialSnapshot={initialAnalytics}
          />
        </div>
      </div>
    </>
  );
}
