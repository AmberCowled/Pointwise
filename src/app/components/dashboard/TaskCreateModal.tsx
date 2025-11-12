import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import TaskItem from './TaskItem';
import type { DashboardTask } from './TaskList';

export type TaskFormValues = {
  title: string;
  category: string;
  xpValue: number;
  context: string;
  startAt?: string | null;
  dueAt?: string | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays?: number[];
  recurrenceMonthDays?: number[];
  timesOfDay?: string[];
};

type TaskCreateModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  onSubmit?: (values: TaskFormValues) => Promise<void> | void;
  loading?: boolean;
};

const CATEGORIES = ['Focus', 'Planning', 'Communication', 'Health', 'Custom'];

const REPEAT_OPTIONS: Array<{
  label: string;
  value: TaskFormValues['recurrence'];
}> = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_TIME_OF_DAY = '09:00';

function toLocalDateTimeString(
  date?: Date,
  time: string = DEFAULT_TIME_OF_DAY,
) {
  const base = date ? new Date(date) : new Date();
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${time}`;
}

export default function TaskCreateModal({
  open,
  onClose,
  defaultDate,
  onSubmit,
  loading = false,
}: TaskCreateModalProps) {
  const initialDate = useMemo(
    () => toLocalDateTimeString(defaultDate),
    [defaultDate],
  );

  const [form, setForm] = useState<TaskFormValues>({
    title: '',
    category: CATEGORIES[0],
    xpValue: 50,
    context: '',
    startAt: undefined,
    dueAt: initialDate,
    recurrence: 'none',
    recurrenceDays: [],
    recurrenceMonthDays: [],
    timesOfDay: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStart, setHasStart] = useState(false);
  const [hasDue, setHasDue] = useState(Boolean(initialDate));

  const handleChange = <T extends keyof TaskFormValues>(
    key: T,
    value: TaskFormValues[T],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWeekday = (index: number) => {
    setForm((prev) => {
      const days = new Set(prev.recurrenceDays);
      if (days.has(index)) {
        days.delete(index);
      } else {
        days.add(index);
      }
      return { ...prev, recurrenceDays: Array.from(days).sort() };
    });
  };

  const addTimeOfDay = () => {
    setForm((prev) => ({
      ...prev,
      timesOfDay: [...(prev.timesOfDay ?? []), '09:00'],
    }));
  };

  const updateTimeOfDay = (index: number, value: string) => {
    setForm((prev) => {
      const times = [...(prev.timesOfDay ?? [])];
      times[index] = value;
      return { ...prev, timesOfDay: times };
    });
  };

  const removeTimeOfDay = (index: number) => {
    setForm((prev) => {
      const times = [...(prev.timesOfDay ?? [])];
      times.splice(index, 1);
      return { ...prev, timesOfDay: times };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Title is required';
    }

    if (form.recurrence === 'weekly' && !(form.recurrenceDays?.length ?? 0)) {
      nextErrors.recurrenceDays = 'Select at least one weekday';
    }

    if (
      form.recurrence === 'monthly' &&
      !(form.recurrenceMonthDays?.length ?? 0)
    ) {
      nextErrors.recurrenceMonthDays = 'Choose at least one day of the month';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit?.({
        ...form,
        startAt: hasStart ? (form.startAt ?? null) : null,
        dueAt: hasDue ? (form.dueAt ?? null) : null,
        recurrence: form.recurrence ?? 'none',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-950/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-6"
            >
              <Dialog.Panel className="relative flex h-screen w-full flex-col bg-zinc-950 text-zinc-100">
                <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-zinc-100">
                      Create Task
                    </Dialog.Title>
                    <p className="text-sm text-zinc-500">
                      Plan a task, attach XP rewards, and optionally set
                      recurring rules.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-rose-400/60 hover:text-white"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Close
                  </button>
                </header>

                <form
                  className="flex-1 overflow-y-auto px-6 py-8"
                  onSubmit={handleSubmit}
                >
                  <section className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                          Task title
                        </label>
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="What do you need to get done?"
                          value={form.title}
                          onChange={(event) =>
                            handleChange('title', event.target.value)
                          }
                          required
                        />
                        {errors.title ? (
                          <p className="text-xs text-rose-400">
                            {errors.title}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                          Context / notes
                        </label>
                        <textarea
                          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="Add extra detail, links, or reminders"
                          value={form.context}
                          onChange={(event) =>
                            handleChange('context', event.target.value)
                          }
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Category
                          </label>
                          <Listbox
                            value={form.category}
                            onChange={(value: string) =>
                              handleChange('category', value)
                            }
                          >
                            <div className="relative">
                              <Listbox.Button className="relative w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-100 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                                <span>{form.category}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                                  ▾
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-2 text-sm shadow-lg shadow-indigo-500/20 focus:outline-none">
                                  {CATEGORIES.map((category) => (
                                    <Listbox.Option
                                      key={category}
                                      value={category}
                                      className={({ active, selected }) => {
                                        const base =
                                          'cursor-pointer rounded-xl px-3 py-2';
                                        if (selected)
                                          return `${base} bg-indigo-500/20 text-white`;
                                        if (active)
                                          return `${base} bg-indigo-500/10 text-zinc-100`;
                                        return `${base} text-zinc-300`;
                                      }}
                                    >
                                      {category}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            XP reward
                          </label>
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            type="number"
                            min={0}
                            step={10}
                            value={form.xpValue}
                            onChange={(event) =>
                              handleChange(
                                'xpValue',
                                Number(event.target.value),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Due date & time
                          </label>
                          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border border-white/20 bg-transparent"
                              checked={hasDue}
                              onChange={(event) => {
                                const next = event.target.checked;
                                setHasDue(next);
                                if (next && !form.dueAt) {
                                  handleChange(
                                    'dueAt',
                                    toLocalDateTimeString(defaultDate),
                                  );
                                }
                                if (!next) {
                                  handleChange('dueAt', undefined);
                                }
                              }}
                            />
                            <span>Set due date</span>
                          </label>
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-40"
                            type="datetime-local"
                            value={hasDue ? (form.dueAt ?? '') : ''}
                            onChange={(event) =>
                              handleChange(
                                'dueAt',
                                event.target.value || undefined,
                              )
                            }
                            disabled={!hasDue}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Repeat
                          </label>
                          <Listbox
                            value={form.recurrence ?? 'none'}
                            onChange={(value: TaskFormValues['recurrence']) =>
                              handleChange('recurrence', value)
                            }
                          >
                            <div className="relative">
                              <Listbox.Button className="relative w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-100 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                                <span>
                                  {REPEAT_OPTIONS.find(
                                    (option) =>
                                      option.value ===
                                      (form.recurrence ?? 'none'),
                                  )?.label ?? 'Does not repeat'}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                                  ▾
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-2 text-sm shadow-lg shadow-indigo-500/20 focus:outline-none">
                                  {REPEAT_OPTIONS.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      value={option.value ?? 'none'}
                                      className={({ active, selected }) => {
                                        const base =
                                          'cursor-pointer rounded-xl px-3 py-2';
                                        if (selected)
                                          return `${base} bg-indigo-500/20 text-white`;
                                        if (active)
                                          return `${base} bg-indigo-500/10 text-zinc-100`;
                                        return `${base} text-zinc-300`;
                                      }}
                                    >
                                      {option.label}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      </div>

                      {form.recurrence === 'weekly' ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Repeat on
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map((weekday, index) => {
                              const isActive =
                                form.recurrenceDays?.includes(index);
                              return (
                                <button
                                  key={weekday}
                                  type="button"
                                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    isActive
                                      ? 'border-indigo-400/60 bg-indigo-500/20 text-white'
                                      : 'border-white/10 text-zinc-300 hover:border-indigo-400/60 hover:text-white'
                                  }`}
                                  onClick={() => toggleWeekday(index)}
                                >
                                  {weekday}
                                </button>
                              );
                            })}
                          </div>
                          {errors.recurrenceDays ? (
                            <p className="text-xs text-rose-400">
                              {errors.recurrenceDays}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {form.recurrence === 'monthly' ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                            Repeat on day of month
                          </p>
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            type="text"
                            placeholder="e.g. 1, 10, 24"
                            value={(form.recurrenceMonthDays ?? []).join(', ')}
                            onChange={(event) => {
                              const raw = event.target.value;
                              const parsed = raw
                                .split(',')
                                .map((part) => Number(part.trim()))
                                .filter(
                                  (num) =>
                                    Number.isFinite(num) &&
                                    num >= 1 &&
                                    num <= 31,
                                );
                              handleChange('recurrenceMonthDays', parsed);
                            }}
                          />
                          {errors.recurrenceMonthDays ? (
                            <p className="text-xs text-rose-400">
                              {errors.recurrenceMonthDays}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {form.recurrence && form.recurrence !== 'none' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                              Times of day
                            </p>
                            <button
                              type="button"
                              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white"
                              onClick={addTimeOfDay}
                            >
                              Add time
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {(form.timesOfDay ?? []).map((time, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <input
                                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                  type="time"
                                  value={time}
                                  onChange={(event) =>
                                    updateTimeOfDay(index, event.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/40 text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-100"
                                  onClick={() => removeTimeOfDay(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                          Start date & time
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded border border-white/20 bg-transparent"
                            checked={hasStart}
                            onChange={(event) => {
                              const next = event.target.checked;
                              setHasStart(next);
                              if (next && !form.startAt) {
                                handleChange(
                                  'startAt',
                                  toLocalDateTimeString(defaultDate),
                                );
                              }
                              if (!next) {
                                handleChange('startAt', undefined);
                              }
                            }}
                          />
                          <span>Set start date</span>
                        </label>
                        {hasStart ? (
                          <input
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            type="datetime-local"
                            value={form.startAt ?? ''}
                            onChange={(event) =>
                              handleChange(
                                'startAt',
                                event.target.value || undefined,
                              )
                            }
                          />
                        ) : null}
                      </div>
                    </div>

                    <aside className="space-y-6">
                      <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                          Preview
                        </p>
                        <TaskItem
                          task={
                            {
                              id: 'preview',
                              title: form.title || 'Untitled task',
                              context:
                                form.context ||
                                'Add context to describe what success looks like.',
                              xp: form.xpValue,
                              status: 'scheduled',
                              startAt: hasStart ? (form.startAt ?? null) : null,
                              dueAt: form.dueAt,
                              completed: false,
                            } satisfies DashboardTask
                          }
                          isProcessing={false}
                        />
                      </div>

                      <div className="space-y-3 rounded-3xl border border-white/5 bg-zinc-900/60 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                          Gamification hints
                        </p>
                        <ul className="space-y-2 text-xs text-zinc-400">
                          <li>
                            Reward deep work with higher XP to boost streak
                            momentum.
                          </li>
                          <li>
                            Recurring tasks keep your routine sharp—set daily or
                            weekly anchors.
                          </li>
                          <li>
                            Break big goals into smaller tasks to earn
                            consistent progress.
                          </li>
                        </ul>
                      </div>
                    </aside>
                  </section>

                  <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-rose-400/60 hover:text-white"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create task'}
                    </button>
                  </footer>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
