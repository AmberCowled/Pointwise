'use client';

import { useEffect, useState } from 'react';
import TaskList from '@pointwise/app/components/dashboard/TaskList';
import { Button } from '@pointwise/app/components/ui/Button';
import TaskSectionCard from './TaskSectionCard';
import TaskDayControls from './TaskDayControls';
import TaskBoardLoadingState from './TaskBoardLoadingState';
import TaskBoardEmptyState from './TaskBoardEmptyState';
import type { TaskBoardProps, TaskBoardViewMode } from './types';

export type { TaskBoardProps };

export default function TaskBoard({
  scheduledTasks,
  optionalTasks,
  overdueTasks,
  upcomingTasks,
  selectedDate,
  selectedDateLabel,
  selectedDateInputValue,
  onSelectedDateChange,
  onCreateTask,
  onTaskClick,
  onCompleteTask,
  completingTaskId,
  locale,
  timeZone,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
}: TaskBoardProps) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [internalViewMode, setInternalViewMode] =
    useState<TaskBoardViewMode>('day');

  // Use external viewMode if provided, otherwise use internal state
  const effectiveViewMode = externalViewMode ?? internalViewMode;
  const effectiveSetViewMode = externalOnViewModeChange ?? setInternalViewMode;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHasHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="space-y-6">
      <TaskSectionCard
        title="Task list"
        eyebrow="Overview"
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCreateTask}
            className="rounded-full"
          >
            Create Task
          </Button>
        }
      >
        <TaskDayControls
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedDateInputValue={selectedDateInputValue}
          onDateChange={onSelectedDateChange}
          viewMode={effectiveViewMode}
          onViewModeChange={effectiveSetViewMode}
          timeZone={timeZone}
        />
        <div className="mt-5" suppressHydrationWarning>
          {!hasHydrated ? (
            <TaskBoardLoadingState />
          ) : scheduledTasks.length > 0 ? (
            <TaskList
              tasks={scheduledTasks}
              onComplete={onCompleteTask}
              completingTaskId={completingTaskId}
              onTaskClick={onTaskClick}
              locale={locale}
              timeZone={timeZone}
            />
          ) : (
            <TaskBoardEmptyState selectedDateLabel={selectedDateLabel} />
          )}
        </div>
      </TaskSectionCard>

      {hasHydrated && overdueTasks.length > 0 ? (
        <TaskSectionCard
          title="Overdue tasks"
          eyebrow={<span className="text-rose-400/70">Needs attention</span>}
        >
          <TaskList
            tasks={overdueTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}

      {hasHydrated && optionalTasks.length > 0 ? (
        <TaskSectionCard title="Optional tasks" eyebrow="Backlog">
          <TaskList
            tasks={optionalTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}

      {hasHydrated && upcomingTasks.length > 0 ? (
        <TaskSectionCard title="Upcoming tasks" eyebrow="Future">
          <TaskList
            tasks={upcomingTasks}
            onComplete={onCompleteTask}
            completingTaskId={completingTaskId}
            onTaskClick={onTaskClick}
            locale={locale}
            timeZone={timeZone}
          />
        </TaskSectionCard>
      ) : null}
    </section>
  );
}
