'use client';

import { useId } from 'react';
import { addDays, startOfDay } from '@pointwise/lib/datetime';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type TaskDayControlsProps = {
  selectedDate: Date;
  selectedDateLabel: string;
  selectedDateInputValue: string;
  onDateChange: (next: Date) => void;
  className?: string;
  timeZone: string;
};

export default function TaskDayControls({
  selectedDate,
  selectedDateLabel,
  selectedDateInputValue,
  onDateChange,
  className,
  timeZone,
}: TaskDayControlsProps) {
  const dateInputId = useId();

  return (
    <div
      className={classNames(
        'flex flex-wrap items-center gap-3 text-xs text-zinc-400',
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
        {selectedDateLabel}
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
          onClick={() => onDateChange(addDays(selectedDate, -1, timeZone))}
        >
          ⟨ Prev
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
          onClick={() => onDateChange(startOfDay(new Date(), timeZone))}
        >
          Today
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-2 py-1 font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
          onClick={() => onDateChange(addDays(selectedDate, 1, timeZone))}
        >
          Next ⟩
        </button>
      </div>
      <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-zinc-200">
        <span className="text-xs text-zinc-400">Jump to</span>
        <input
          id={dateInputId}
          name="task-board-date"
          className="cursor-pointer border-0 bg-transparent text-sm text-zinc-100 focus:outline-none"
          type="date"
          value={selectedDateInputValue}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            const nextStart = startOfDay(value, timeZone);
            onDateChange(nextStart);
          }}
        />
      </label>
    </div>
  );
}
