'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import TaskItem from './TaskItem';
import type { DashboardTask } from './TaskList';
import GradientButton from '../ui/GradientButton';
import { extractTime, toLocalDateTimeString } from '@pointwise/lib/datetime';
import {
  CORE_TASK_CATEGORIES,
  CUSTOM_CATEGORY_LABEL,
  MAX_CUSTOM_CATEGORY_LENGTH,
  isCoreTaskCategory,
} from '@pointwise/lib/categories';
import {
  FullScreenModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { FormSelect, type FormSelectOption } from '../ui/FormSelect';

export type TaskFormValues = {
  id?: string;
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
  mode?: 'create' | 'edit';
  task?: DashboardTask | null;
  errorMessage?: string | null;
};

const CUSTOM_CATEGORY_OPTION_VALUE = '__custom__';

const CATEGORY_OPTIONS: FormSelectOption<string>[] = [
  ...CORE_TASK_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
  {
    label: CUSTOM_CATEGORY_LABEL,
    value: CUSTOM_CATEGORY_OPTION_VALUE,
  },
];

const REPEAT_OPTIONS: FormSelectOption<TaskFormValues['recurrence']>[] = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_TIME_OF_DAY = '09:00';
const TITLE_MAX_LENGTH = 200;
const CONTEXT_MAX_LENGTH = 5000;

export default function TaskCreateModal({
  open,
  onClose,
  defaultDate,
  onSubmit,
  loading = false,
  mode = 'create',
  task,
  errorMessage,
}: TaskCreateModalProps) {
  const initialDate = useMemo(
    () => toLocalDateTimeString(defaultDate, DEFAULT_TIME_OF_DAY),
    [defaultDate],
  );

  const editingTask = mode === 'edit' && task ? task : null;

  const initialCategoryValue = editingTask?.category ?? CORE_TASK_CATEGORIES[0];
  const initialCategorySelection = isCoreTaskCategory(initialCategoryValue)
    ? initialCategoryValue
    : CUSTOM_CATEGORY_OPTION_VALUE;

  const defaultStartValue = editingTask?.startAt
    ? toLocalDateTimeString(
        new Date(editingTask.startAt as string),
        extractTime(editingTask.startAt, DEFAULT_TIME_OF_DAY),
      )
    : undefined;
  const defaultDueValue = editingTask?.dueAt
    ? toLocalDateTimeString(
        new Date(editingTask.dueAt as string),
        extractTime(editingTask.dueAt, DEFAULT_TIME_OF_DAY),
      )
    : initialDate;

  const [customCategory, setCustomCategory] = useState<string>(() =>
    initialCategorySelection === CUSTOM_CATEGORY_OPTION_VALUE
      ? initialCategoryValue
      : '',
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySelection,
  );

  const [form, setForm] = useState<TaskFormValues>(() => ({
    id: editingTask?.id,
    title: editingTask?.title ?? '',
    category: initialCategoryValue,
    xpValue: editingTask?.xp ?? 50,
    context: editingTask?.context ?? '',
    startAt: defaultStartValue,
    dueAt: defaultDueValue,
    recurrence: 'none',
    recurrenceDays: [],
    recurrenceMonthDays: [],
    timesOfDay: [],
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasStart, setHasStart] = useState(Boolean(defaultStartValue));
  const [hasDue, setHasDue] = useState(Boolean(defaultDueValue));

  const titleFieldId = useId();
  const contextFieldId = useId();
  const categoryFieldId = useId();
  const customCategoryFieldId = useId();
  const xpFieldId = useId();
  const dueFieldId = useId();
  const startFieldId = useId();

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearDateOrderError = useCallback(() => {
    clearError('dateOrder');
  }, [clearError]);

  const updateStartAt = useCallback(
    (value?: string) => {
      const nextStart = value && value.length > 0 ? value : undefined;
      let nextDue: string | undefined;
      setForm((prev) => {
        nextDue = prev.dueAt ?? undefined;
        if (
          hasDue &&
          nextStart &&
          nextDue &&
          new Date(nextStart).getTime() > new Date(nextDue).getTime()
        ) {
          nextDue = nextStart;
        }
        return { ...prev, startAt: nextStart, dueAt: nextDue };
      });

      clearDateOrderError();
    },
    [clearDateOrderError, hasDue],
  );

  const updateDueAt = useCallback(
    (value?: string) => {
      const nextDue = value && value.length > 0 ? value : undefined;
      let nextStart: string | undefined;
      setForm((prev) => {
        nextStart = prev.startAt ?? undefined;
        if (
          hasStart &&
          nextStart &&
          nextDue &&
          new Date(nextStart).getTime() > new Date(nextDue).getTime()
        ) {
          nextStart = nextDue;
        }
        return { ...prev, startAt: nextStart, dueAt: nextDue };
      });

      clearDateOrderError();
    },
    [clearDateOrderError, hasStart],
  );

  const handleChange = <T extends keyof TaskFormValues>(
    key: T,
    value: TaskFormValues[T],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    clearError('category');
    setForm((prev) => ({
      ...prev,
      category: value === CUSTOM_CATEGORY_OPTION_VALUE ? customCategory : value,
    }));
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    if (selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE) {
      setForm((prev) => ({ ...prev, category: value }));
    }
    clearError('category');
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

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Title is required';
    } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      nextErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`;
    }

    const trimmedContext = form.context?.trim() ?? '';
    if (trimmedContext.length > CONTEXT_MAX_LENGTH) {
      nextErrors.context = `Context must be ${CONTEXT_MAX_LENGTH} characters or fewer`;
    }

    if (!Number.isFinite(form.xpValue) || form.xpValue < 0) {
      nextErrors.xpValue = 'XP must be zero or greater';
    } else if (form.xpValue > 1_000_000) {
      nextErrors.xpValue = 'XP must be 1,000,000 or fewer';
    }

    const rawCategory = form.category ?? '';
    const trimmedCategory = rawCategory.trim();
    const finalCategory =
      selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE
        ? trimmedCategory
        : selectedCategory;
    if (selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE) {
      if (!trimmedCategory) {
        nextErrors.category = 'Enter a custom category name';
      } else if (trimmedCategory.length > MAX_CUSTOM_CATEGORY_LENGTH) {
        nextErrors.category = `Custom categories must be ${MAX_CUSTOM_CATEGORY_LENGTH} characters or fewer`;
      }
    } else if (!trimmedCategory) {
      nextErrors.category = 'Choose a category';
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

    const startDate = hasStart && form.startAt ? new Date(form.startAt) : null;
    const dueDate = hasDue && form.dueAt ? new Date(form.dueAt) : null;
    if (startDate && dueDate && startDate.getTime() > dueDate.getTime()) {
      nextErrors.dateOrder = 'Start date must be before or equal to due date';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const submission: TaskFormValues = {
        ...form,
        title: trimmedTitle,
        context: trimmedContext,
        category: finalCategory,
        id: form.id,
        startAt: hasStart ? (form.startAt ?? null) : null,
        dueAt: hasDue ? (form.dueAt ?? null) : null,
        recurrence: form.recurrence ?? 'none',
      };

      await onSubmit?.(submission);
      onClose();
    } catch (error) {
      const action = mode === 'edit' ? 'update' : 'create';
      console.error(`Failed to ${action} task`, error);
    }
  };

  const modalTitle = mode === 'edit' ? 'Edit task' : 'Create task';
  const modalSubtitle =
    mode === 'edit'
      ? 'Update task details or reschedule as needed.'
      : 'Plan a task, attach XP rewards, and optionally set recurring rules.';

  return (
    <FullScreenModal open={open} onClose={onClose}>
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <ModalHeader
          title={modalTitle}
          subtitle={modalSubtitle}
          actions={
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-rose-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          }
        />

        <ModalBody>
          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <FormField
                label="Task title"
                htmlFor={titleFieldId}
                error={errors.title}
              >
                <input
                  id={titleFieldId}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="What do you need to get done?"
                  value={form.title}
                  onChange={(event) =>
                    handleChange('title', event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField
                label="Context / notes"
                htmlFor={contextFieldId}
                error={errors.context}
              >
                <textarea
                  id={contextFieldId}
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Add extra detail, links, or reminders"
                  value={form.context}
                  onChange={(event) =>
                    handleChange('context', event.target.value)
                  }
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Category"
                  htmlFor={categoryFieldId}
                  error={errors.category}
                >
                  <FormSelect
                    id={categoryFieldId}
                    value={selectedCategory}
                    onChange={handleCategorySelect}
                    options={CATEGORY_OPTIONS}
                  />
                  {selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE ? (
                    <input
                      id={customCategoryFieldId}
                      className="mt-2 w-full rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Name your category"
                      value={customCategory}
                      onChange={(event) =>
                        handleCustomCategoryChange(event.target.value)
                      }
                      maxLength={60}
                    />
                  ) : null}
                </FormField>

                <FormField
                  label="XP reward"
                  htmlFor={xpFieldId}
                  error={errors.xpValue}
                >
                  <input
                    id={xpFieldId}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    type="number"
                    min={0}
                    step={1}
                    value={form.xpValue}
                    onChange={(event) =>
                      handleChange('xpValue', Number(event.target.value))
                    }
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Due date & time"
                  htmlFor={dueFieldId}
                  error={errors.dateOrder}
                >
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border border-white/20 bg-transparent"
                      checked={hasDue}
                      onChange={(event) => {
                        const next = event.target.checked;
                        setHasDue(next);
                        if (next && !form.dueAt) {
                          updateDueAt(
                            toLocalDateTimeString(
                              form.startAt
                                ? new Date(form.startAt)
                                : defaultDate,
                            ),
                          );
                        }
                        if (!next) {
                          setForm((prev) => ({
                            ...prev,
                            dueAt: undefined,
                          }));
                          clearDateOrderError();
                        }
                      }}
                    />
                    <span>Set due date</span>
                  </label>
                  <input
                    id={dueFieldId}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-40"
                    type="datetime-local"
                    value={hasDue ? (form.dueAt ?? '') : ''}
                    min={hasStart && form.startAt ? form.startAt : undefined}
                    onChange={(event) =>
                      updateDueAt(event.target.value || undefined)
                    }
                    disabled={!hasDue}
                  />
                </FormField>

                <FormField label="Repeat" error={errors.recurrence}>
                  <FormSelect
                    value={form.recurrence ?? 'none'}
                    onChange={(value: TaskFormValues['recurrence']) =>
                      handleChange('recurrence', value)
                    }
                    options={REPEAT_OPTIONS}
                  />
                </FormField>
              </div>

              {form.recurrence === 'weekly' ? (
                <FormField
                  label="Repeat on"
                  error={errors.recurrenceDays}
                  bodyClassName="space-y-3"
                >
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
                          onClick={() => toggleWeekday(index)}
                        >
                          {weekday}
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              ) : null}

              {form.recurrence === 'monthly' ? (
                <FormField
                  label="Repeat on day of month"
                  error={errors.recurrenceMonthDays}
                >
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
                            Number.isFinite(num) && num >= 1 && num <= 31,
                        );
                      handleChange('recurrenceMonthDays', parsed);
                    }}
                  />
                </FormField>
              ) : null}

              {form.recurrence && form.recurrence !== 'none' ? (
                <FormField label="Times of day" bodyClassName="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Schedule XP drops
                    </span>
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
                      <div key={index} className="flex items-center gap-2">
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
                          className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400 transition hover:border-rose-400/60 hover:text-rose-200"
                          onClick={() => removeTimeOfDay(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </FormField>
              ) : null}

              <FormField label="Start date & time" htmlFor={startFieldId}>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border border-white/20 bg-transparent"
                    checked={hasStart}
                    onChange={(event) => {
                      const next = event.target.checked;
                      setHasStart(next);
                      if (next && !form.startAt) {
                        updateStartAt(
                          toLocalDateTimeString(
                            form.dueAt ? new Date(form.dueAt) : defaultDate,
                          ),
                        );
                      }
                      if (!next) {
                        setForm((prev) => ({
                          ...prev,
                          startAt: undefined,
                        }));
                        clearDateOrderError();
                      }
                    }}
                  />
                  <span>Set start date</span>
                </label>
                {hasStart ? (
                  <input
                    id={startFieldId}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    type="datetime-local"
                    value={form.startAt ?? ''}
                    max={hasDue && form.dueAt ? form.dueAt : undefined}
                    onChange={(event) =>
                      updateStartAt(event.target.value || undefined)
                    }
                  />
                ) : null}
              </FormField>
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
                      category:
                        selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE
                          ? customCategory || CUSTOM_CATEGORY_LABEL
                          : selectedCategory,
                      xp: form.xpValue,
                      status: 'scheduled',
                      startAt: hasStart ? (form.startAt ?? null) : null,
                      dueAt: hasDue ? (form.dueAt ?? null) : null,
                      sourceRecurringTaskId: undefined,
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
                    Reward deep work with higher XP to boost streak momentum.
                  </li>
                  <li>
                    Recurring tasks keep your routine sharp—set daily or weekly
                    anchors.
                  </li>
                  <li>
                    Break big goals into smaller tasks to earn consistent
                    progress.
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </ModalBody>

        <ModalFooter align="between">
          <button
            type="button"
            className="w-full rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-rose-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <GradientButton
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {mode === 'edit' ? 'Save changes' : 'Create task'}
          </GradientButton>
        </ModalFooter>
      </form>
    </FullScreenModal>
  );
}
