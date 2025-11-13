'use client';

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
}: TaskBoardProps) {
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
        />
        {scheduledTasks.length > 0 ? (
          <div className="mt-5">
            <TaskList
              tasks={scheduledTasks}
              onComplete={onCompleteTask}
              completingTaskId={completingTaskId}
              onTaskClick={onTaskClick}
            />
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
            No tasks scheduled for{' '}
            <span className="font-medium text-zinc-200">
              {selectedDateLabel}
            </span>
            . Add one with{' '}
            <span className="font-medium text-zinc-200">Create Task</span> or
            set up a recurring routine.
          </div>
        )}
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
          />
        </TaskSectionCard>
      ) : null}
    </section>
  );
}
