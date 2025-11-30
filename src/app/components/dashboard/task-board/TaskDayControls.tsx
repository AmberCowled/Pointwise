'use client';

import { addDays, startOfDay } from '@pointwise/lib/datetime';

import { Button } from '@pointwise/app/components/ui/Button';
import TaskBoardViewModeSelect from './TaskBoardViewModeSelect';
import type { TaskBoardViewMode } from './types';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type TaskDayControlsProps = {
  selectedDate: Date;
  selectedDateLabel: string;
  selectedDateInputValue: string;
  onDateChange: (next: Date) => void;
  viewMode: TaskBoardViewMode;
  onViewModeChange: (mode: TaskBoardViewMode) => void;
  className?: string;
  timeZone: string;
};

export default function TaskDayControls({
  selectedDate,
  selectedDateLabel,
  selectedDateInputValue,
  onDateChange,
  viewMode,
  onViewModeChange,
  className,
  timeZone,
}: TaskDayControlsProps) {
  return (
    <div
      className={classNames(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
          {selectedDateLabel}
        </div>
        <div className="inline-flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (viewMode === 'week') {
                onDateChange(addDays(selectedDate, -7, timeZone));
              } else if (viewMode === 'month') {
                onDateChange(addDays(selectedDate, -30, timeZone));
              } else {
                onDateChange(addDays(selectedDate, -1, timeZone));
              }
            }}
            className="rounded-full"
          >
            ⟨ Prev
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onDateChange(startOfDay(new Date(), timeZone))}
            className="rounded-full"
          >
            Today
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (viewMode === 'week') {
                onDateChange(addDays(selectedDate, 7, timeZone));
              } else if (viewMode === 'month') {
                onDateChange(addDays(selectedDate, 30, timeZone));
              } else {
                onDateChange(addDays(selectedDate, 1, timeZone));
              }
            }}
            className="rounded-full"
          >
            Next ⟩
          </Button>
        </div>
        <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
          <span className="text-xs text-zinc-400">Jump to</span>
          <input
            name="task-board-date"
            type="date"
            value={selectedDateInputValue}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              const nextStart = startOfDay(value, timeZone);
              onDateChange(nextStart);
            }}
            className="cursor-pointer border-0 bg-transparent text-sm text-zinc-100 focus:outline-none"
          />
        </label>
      </div>
      <TaskBoardViewModeSelect value={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
