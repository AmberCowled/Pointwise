'use client';

import type { DashboardTask } from './TaskList';

const ACTION_LABEL: Record<DashboardTask['status'], string> = {
  'in-progress': 'Resume',
  focus: 'Start focus session',
  scheduled: 'Schedule',
  completed: 'Completed',
};

type TaskItemProps = {
  task: DashboardTask;
  onComplete?: (task: DashboardTask) => void;
  isProcessing?: boolean;
  onOpen?: (task: DashboardTask) => void;
  showActions?: boolean;
};

const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function toDate(input?: string | Date | null) {
  if (!input) return null;
  const value = input instanceof Date ? input : new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function getTaskScheduleLabel(task: DashboardTask) {
  const safeStart = toDate(task.startAt);
  const safeEnd = toDate(task.dueAt);

  if (!safeStart && !safeEnd) return null;

  if (safeStart && safeEnd) {
    const sameDay = isSameDay(safeStart, safeEnd);
    if (sameDay) {
      const datePart = formatDatePart(safeStart);
      const startTime = formatTimePart(safeStart);
      const endTime = formatTimePart(safeEnd);
      const timeRange = startTime === endTime ? '' : ` – ${endTime}`;
      return `${datePart} · ${startTime}${timeRange}`;
    }
    return `${formatDateTime(safeStart)} → ${formatDateTime(safeEnd)}`;
  }

  if (safeStart) return formatDateTime(safeStart);
  return formatDateTime(safeEnd!);
}

function formatDateTime(date: Date) {
  return `${formatDatePart(date)} · ${formatTimePart(date)}`;
}

function formatDatePart(date: Date) {
  const weekday = DAY_ABBREVIATIONS[date.getDay()];
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  const day = date.getDate();
  return `${weekday}, ${String(day).padStart(2, '0')} ${month}`;
}

function formatTimePart(date: Date) {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const period = hours24 < 12 ? 'AM' : 'PM';
  return `${hours12}:${minutes} ${period}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const subtitleFallback = (task: DashboardTask) =>
  task.context ?? task.category ?? '';

export default function TaskItem({
  task,
  onComplete,
  isProcessing = false,
  onOpen,
  showActions = true,
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

  const scheduleLabel = getTaskScheduleLabel(task);

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
