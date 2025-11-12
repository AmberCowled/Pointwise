'use client';

import type { DashboardTask } from './TaskList';

const ACTION_LABEL: Record<DashboardTask['status'], string> = {
  'in-progress': 'Resume',
  focus: 'Start focus session',
  scheduled: 'Schedule',
};

type TaskItemProps = {
  task: DashboardTask;
  onComplete?: (task: DashboardTask) => void;
  isProcessing?: boolean;
};

export default function TaskItem({
  task,
  onComplete,
  isProcessing = false,
}: TaskItemProps) {
  const isCompleted = Boolean(task.completed);
  const isDisabled = isCompleted || isProcessing;
  const actionLabel = isCompleted
    ? 'Completed'
    : isProcessing
      ? 'Awarding...'
      : ACTION_LABEL[task.status];

  const containerClass = [
    'group rounded-2xl border border-white/5 p-4 transition',
    isCompleted
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : 'bg-zinc-950/40 hover:border-indigo-400/40 hover:bg-indigo-500/5',
  ].join(' ');

  const buttonClass = [
    'rounded-full border px-3 py-1 text-xs font-medium transition',
    isDisabled
      ? 'border-white/5 text-zinc-500'
      : 'border-white/10 text-zinc-300 group-hover:border-indigo-400/60 group-hover:text-white',
  ].join(' ');

  return (
    <li className={containerClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-base font-medium text-zinc-100">{task.title}</p>
          <p className="text-sm text-zinc-400">{task.context}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            +{task.xp} XP
          </span>
          <button
            type="button"
            className={buttonClass}
            disabled={isDisabled}
            onClick={() => onComplete?.(task)}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </li>
  );
}
