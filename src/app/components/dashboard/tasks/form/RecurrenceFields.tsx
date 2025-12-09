'use client';

import { Input } from '../../../ui/Input';
import { InputSelect } from '../../../ui/InputSelect';
import type { TaskFormValues } from './types';
import { REPEAT_OPTIONS, WEEKDAYS } from './constants';

type RecurrenceFieldsProps = {
  form: TaskFormValues;
  errors: Record<string, string>;
  onRecurrenceChange: (value: TaskFormValues['recurrence']) => void;
  onRecurrenceMonthDaysChange: (days: number[]) => void;
  onToggleWeekday: (index: number) => void;
  onAddTimeOfDay: () => void;
  onUpdateTimeOfDay: (index: number, value: string) => void;
  onRemoveTimeOfDay: (index: number) => void;
};

export function RecurrenceFields({
  form,
  errors,
  onRecurrenceChange,
  onRecurrenceMonthDaysChange,
  onToggleWeekday,
  onAddTimeOfDay,
  onUpdateTimeOfDay,
  onRemoveTimeOfDay,
}: RecurrenceFieldsProps) {
  return (
    <>
      <InputSelect
        label="Repeat"
        value={form.recurrence ?? 'none'}
        onChange={(value) => onRecurrenceChange(value as TaskFormValues['recurrence'])}
        options={REPEAT_OPTIONS}
        error={errors.recurrence}
        fullWidth
      />

      {form.recurrence === 'weekly' ? (
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-300">
            Repeat on
          </label>
          {errors.recurrenceDays ? (
            <p className="mb-2 text-xs text-rose-400">
              {errors.recurrenceDays}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((weekday, index) => {
              const isActive = form.recurrenceDays?.includes(index);
              return (
                <button
                  key={weekday}
                  type="button"
                  className={
                    isActive
                      ? 'rounded-full border border-indigo-400/60 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-white transition'
                      : 'rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white'
                  }
                  onClick={() => onToggleWeekday(index)}
                >
                  {weekday}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {form.recurrence === 'monthly' ? (
        <Input
          name="recurrenceMonthDays"
          label="Repeat on day of month"
          type="text"
          placeholder="e.g. 1, 10, 24"
          value={(form.recurrenceMonthDays ?? []).join(', ')}
          onChange={(event) => {
            const raw = event.target.value;
            const parsed = raw
              .split(',')
              .map((part) => Number(part.trim()))
              .filter(
                (num) => Number.isFinite(num) && num >= 1 && num <= 31,
              );
            onRecurrenceMonthDaysChange(parsed);
          }}
          error={errors.recurrenceMonthDays}
          fullWidth
        />
      ) : null}

      {form.recurrence && form.recurrence !== 'none' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Times of day
            </label>
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
              onClick={onAddTimeOfDay}
            >
              Add time
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {(form.timesOfDay ?? []).map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  name={`time-${index}`}
                  value={time}
                  onChange={(event) =>
                    onUpdateTimeOfDay(index, event.target.value)
                  }
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                />
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400 transition hover:border-rose-400/60 hover:text-rose-200"
                  onClick={() => onRemoveTimeOfDay(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

