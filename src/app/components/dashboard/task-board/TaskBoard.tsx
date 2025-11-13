'use client';

import { useEffect, useState } from 'react';
import TaskList, {
  type DashboardTask,
} from '@pointwise/app/components/dashboard/TaskList';
import TaskSectionCard from './TaskSectionCard';
import TaskDayControls from './TaskDayControls';

export type TaskBoardProps = {
  scheduledTasks: DashboardTask[];
  optionalTasks: DashboardTask[];
  overdueTasks: DashboardTask[];
  selectedDate: Date;
  selectedDateLabel: string;
  selectedDateInputValue: string;
  onSelectedDateChange: (next: Date) => void;
  onCreateTask: () => void;
  onTaskClick: (task: DashboardTask) => void;
  onCompleteTask: (task: DashboardTask) => void;
  completingTaskId: string | null;
  locale: string;
  timeZone: string;
};

export default function TaskBoard({
  scheduledTasks,
  optionalTasks,
  overdueTasks,
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
}: TaskBoardProps) {
  const [hasHydrated, setHasHydrated] = useState(false);

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
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
            onClick={onCreateTask}
          >
            Create Task
          </button>
        }
      >
        <TaskDayControls
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedDateInputValue={selectedDateInputValue}
          onDateChange={onSelectedDateChange}
          timeZone={timeZone}
        />
        <div className="mt-5" suppressHydrationWarning>
          {!hasHydrated ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
              Loading schedule…
            </div>
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
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
              No tasks scheduled for{' '}
              <span className="font-medium text-zinc-200">
                {selectedDateLabel}
              </span>
              . Add one with{' '}
              <span className="font-medium text-zinc-200">Create Task</span> or
              set up a recurring routine.
            </div>
          )}
        </div>
      </TaskSectionCard>

      {overdueTasks.length > 0 ? (
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

      {optionalTasks.length > 0 ? (
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
    </section>
  );
}
