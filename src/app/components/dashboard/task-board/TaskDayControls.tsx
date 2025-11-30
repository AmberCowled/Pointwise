'use client';

import { useRef } from 'react';
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={classNames(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <label
          htmlFor="task-board-date-picker"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 cursor-pointer"
          onClick={(e) => {
            // Call showPicker() directly within the user gesture
            e.preventDefault();
            if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
              dateInputRef.current.showPicker();
            }
          }}
        >
          <input
            ref={dateInputRef}
            id="task-board-date-picker"
            name="task-board-date-picker"
            type="date"
            value={selectedDateInputValue}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              const nextStart = startOfDay(value, timeZone);
              onDateChange(nextStart);
            }}
            onClick={(e) => {
              // Open the native calendar picker on click
              const target = e.target as HTMLInputElement;
              if ('showPicker' in target) {
                target.showPicker();
              }
            }}
            onKeyDown={(e) => {
              // Prevent typing - only allow calendar picker
              if (
                e.key !== 'Enter' &&
                e.key !== ' ' &&
                e.key !== 'Tab' &&
                e.key !== 'ArrowUp' &&
                e.key !== 'ArrowDown'
              ) {
                e.preventDefault();
              }
              // Open picker on Enter or Space
              if (
                (e.key === 'Enter' || e.key === ' ') &&
                dateInputRef.current &&
                'showPicker' in dateInputRef.current
              ) {
                e.preventDefault();
                dateInputRef.current.showPicker();
              }
            }}
            className="sr-only"
            aria-label="Select date"
          />
          <span>{selectedDateLabel}</span>
        </label>
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
      </div>
      <TaskBoardViewModeSelect value={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
