'use client';

import type { DashboardTask } from './TaskList';
import {
  formatDatePart,
  formatDateTime,
  formatTimePart,
  isSameDay,
  toDate,
} from '@pointwise/lib/datetime';

const ACTION_LABEL: Record<DashboardTask['status'], string> = {
  'in-progress': 'Resume',
  focus: 'Start focus session',
  scheduled: 'Mark complete',
  completed: 'Completed',
};

type TaskItemProps = {
  task: DashboardTask;
  onComplete?: (task: DashboardTask) => void;
  isProcessing?: boolean;
  onOpen?: (task: DashboardTask) => void;
  showActions?: boolean;
  locale?: string;
  timeZone?: string;
};

export function getTaskScheduleLabel(
  task: DashboardTask,
  locale?: string,
  timeZone?: string,
) {
  const safeStart = toDate(task.startAt);
  const safeEnd = toDate(task.dueAt);

  if (!safeStart && !safeEnd) return null;

  if (safeStart && safeEnd) {
    const sameDay = isSameDay(safeStart, safeEnd, timeZone);
    if (sameDay) {
      const datePart = formatDatePart(safeStart, locale, timeZone);
      const startTime = formatTimePart(safeStart, locale, timeZone);
      const endTime = formatTimePart(safeEnd, locale, timeZone);
      const timeRange = startTime === endTime ? '' : ` – ${endTime}`;
      return `${datePart} · ${startTime}${timeRange}`;
    }
    return `${formatDateTime(safeStart, locale, timeZone)} → ${formatDateTime(
      safeEnd,
      locale,
      timeZone,
    )}`;
  }

  if (safeStart) return formatDateTime(safeStart, locale, timeZone);
  return formatDateTime(safeEnd!, locale, timeZone);
}

const subtitleFallback = (task: DashboardTask) =>
  task.context ?? task.category ?? '';

export default function TaskItem({
  task,
  onComplete,
  isProcessing = false,
  onOpen,
  showActions = true,
  locale,
  timeZone,
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
    'rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400/70',
    isDisabled
      ? 'border-white/5 text-zinc-500'
      : 'border-white/10 text-zinc-300 hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white focus-visible:border-indigo-400/70',
  ].join(' ');

  const scheduleLabel = getTaskScheduleLabel(task, locale, timeZone);

  const subtitle = subtitleFallback(task);

  return (
    <li
      className={containerClass}
      onClick={(event) => {
        if (event.target instanceof HTMLButtonElement) return;
        onOpen?.(task);
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-base font-medium text-zinc-100">{task.title}</p>
          {subtitle ? (
            <p className="text-sm text-zinc-400">{subtitle}</p>
          ) : null}
          {scheduleLabel ? (
            <p className="text-xs font-medium text-indigo-200/80">
              {scheduleLabel}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            +{task.xp} XP
          </span>
          {showActions ? (
            <button
              type="button"
              className={buttonClass}
              disabled={isDisabled}
              onClick={() => onComplete?.(task)}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
