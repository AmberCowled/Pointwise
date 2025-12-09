'use client';

import React from 'react';
import TaskItem from './TaskItem';
import type { DashboardTask } from './TaskList';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { InputArea } from '../../ui/InputArea';
import { InputSelect } from '../../ui/InputSelect';
import {
  DateTimeDefaults,
} from '@pointwise/lib/datetime';
import {
  CUSTOM_CATEGORY_LABEL,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from '@pointwise/lib/categories';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/modals';
import { useNotifications } from '../../ui/NotificationProvider';
import type { TaskFormValues, RecurringTaskData } from './form/types';
import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  CATEGORY_OPTIONS,
  TITLE_MAX_LENGTH,
  CONTEXT_MAX_LENGTH,
} from './form/constants';
import { validateTaskForm } from '@pointwise/lib/validation/task-form';
import { useTaskForm } from '@pointwise/hooks/tasks/useTaskForm';
import { RecurrenceFields } from './form/RecurrenceFields';
import { DateFields } from './form/DateFields';
import { ConvertToOnetimeModal } from './form/ConvertToOnetimeModal';

type TaskCreateModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  onSubmit?: (values: TaskFormValues) => Promise<void> | void;
  loading?: boolean;
  mode?: 'create' | 'edit';
  task?: DashboardTask | null;
  editScope?: 'single' | 'series';
  recurringTaskData?: RecurringTaskData | null;
  errorMessage?: string | null;
  locale?: string | null;
  timeZone?: string | null;
};

// Re-export for backward compatibility
export type { TaskFormValues } from './form/types';

export default function TaskCreateModal({
  open,
  onClose,
  defaultDate,
  onSubmit,
  loading = false,
  mode = 'create',
  task,
  editScope = 'single',
  recurringTaskData,
  errorMessage,
  locale,
  timeZone,
}: TaskCreateModalProps) {
  const { showNotification } = useNotifications();
  const activeLocale = locale ?? DateTimeDefaults.locale;
  const activeTimeZone = timeZone ?? DateTimeDefaults.timeZone;

  const isEditingSeries = mode === 'edit' && editScope === 'series';

  // Use the form hook to manage all form state
  const {
    form,
    errors,
    selectedCategory,
    customCategory,
    hasStart,
    hasDue,
    showConvertConfirm,
    pendingSubmission,
    titleFieldId,
    contextFieldId,
    categoryFieldId,
    customCategoryFieldId,
    xpFieldId,
    dueFieldId,
    startFieldId,
    handleChange,
    handleCategorySelect,
    handleCustomCategoryChange,
    updateStartAt,
    updateDueAt,
    updateStartTime,
    updateDueTime,
    setHasStart,
    setHasDue,
    toggleWeekday,
    addTimeOfDay,
    updateTimeOfDay,
    removeTimeOfDay,
    clearDateOrderError,
    setErrors,
    setShowConvertConfirm,
    setPendingSubmission,
  } = useTaskForm({
    mode,
    task,
    editScope,
    recurringTaskData,
    defaultDate,
    locale,
    timeZone,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form using shared validation utility
    const validation = validateTaskForm({
      form,
      selectedCategory,
      customCategory,
      hasStart,
      hasDue,
    });

    setErrors(validation.errors);
    if (!validation.isValid || !validation.normalizedValues) return;

    // Use normalized values from validation
    const { title, context, category: finalCategory } = validation.normalizedValues;

    // Check if converting recurring → one-time (editing series and changing recurrence to 'none')
    // recurringTaskData.recurrence is always 'daily' | 'weekly' | 'monthly' (never 'none')
    const isConvertingToOneTime = 
      isEditingSeries && 
      recurringTaskData && 
      form.recurrence === 'none';

    if (isConvertingToOneTime) {
      // Show confirmation modal
      const submission: TaskFormValues = {
        ...form,
        title,
        context,
        category: finalCategory,
        id: form.id,
        startDate: hasStart ? (form.startDate ?? null) : null,
        startTime: hasStart ? (form.startTime ?? null) : null,
        dueDate: hasDue ? (form.dueDate ?? null) : null,
        dueTime: hasDue ? (form.dueTime ?? null) : null,
        recurrence: form.recurrence ?? 'none',
      };
      setPendingSubmission(submission);
      setShowConvertConfirm(true);
      return;
    }

    try {
      const submission: TaskFormValues = {
        ...form,
        title,
        context,
        category: finalCategory,
        id: form.id,
        startDate: hasStart ? (form.startDate ?? null) : null,
        startTime: hasStart ? (form.startTime ?? null) : null,
        dueDate: hasDue ? (form.dueDate ?? null) : null,
        dueTime: hasDue ? (form.dueTime ?? null) : null,
        recurrence: form.recurrence ?? 'none',
      };

      await onSubmit?.(submission);
      onClose();
    } catch (error) {
      const action = mode === 'edit' ? 'update' : 'create';
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${action} task. Please try again.`;
      console.error(`Failed to ${action} task`, error);
      showNotification({
        message,
        variant: 'error',
      });
    }
  };

  const modalTitle = mode === 'edit' ? 'Edit task' : 'Create task';
  const modalSubtitle =
    mode === 'edit'
      ? 'Update task details or reschedule as needed.'
      : 'Plan a task, attach XP rewards, and optionally set recurring rules.';

  return (
    <>
    <Modal open={open} onClose={onClose} size="fullscreen">
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
              <Input
                id={titleFieldId}
                name="title"
                label="Task title"
                placeholder="What do you need to get done?"
                value={form.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('title', event.target.value)}
                error={errors.title}
                required
                fullWidth
                showCharCount
                charCountWarningThreshold={TITLE_MAX_LENGTH * 0.8}
                charCountErrorThreshold={TITLE_MAX_LENGTH}
                maxLength={TITLE_MAX_LENGTH}
              />

              <InputArea
                id={contextFieldId}
                name="context"
                label="Context / notes"
                placeholder="Add extra detail, links, or reminders"
                value={form.context}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange('context', event.target.value)
                }
                error={errors.context}
                fullWidth
                rows={5}
                showCharCount
                charCountWarningThreshold={CONTEXT_MAX_LENGTH * 0.8}
                charCountErrorThreshold={CONTEXT_MAX_LENGTH}
                maxLength={CONTEXT_MAX_LENGTH}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <InputSelect
                    id={categoryFieldId}
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategorySelect}
                    options={CATEGORY_OPTIONS}
                    error={errors.category}
                    fullWidth
                  />
                  {selectedCategory === CUSTOM_CATEGORY_OPTION_VALUE ? (
                    <Input
                      id={customCategoryFieldId}
                      name="customCategory"
                      placeholder="Name your category"
                      value={customCategory}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleCustomCategoryChange(event.target.value)
                      }
                      maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
                      fullWidth
                      variant="secondary"
                      className="mt-2 border-dashed"
                    />
                  ) : null}
                </div>

                <Input
                  id={xpFieldId}
                  name="xpValue"
                  label="XP reward"
                  type="number"
                  min={0}
                  step={1}
                  value={form.xpValue.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('xpValue', Number(event.target.value))
                  }
                  error={errors.xpValue}
                  fullWidth
                />
              </div>

              {/* Show recurrence options when:
                  - Creating a new task
                  - Editing a series (to modify recurrence settings)
                  - Editing a single one-time task (to allow conversion to recurring)
                  - Hide when editing a single task that belongs to a series
              */}
              {(mode === 'create' ||
                (mode === 'edit' && editScope === 'series') ||
                (mode === 'edit' && editScope === 'single' && !task?.sourceRecurringTaskId)) ? (
                <RecurrenceFields
                  form={form}
                  errors={errors}
                  onRecurrenceChange={(value) => handleChange('recurrence', value)}
                  onRecurrenceMonthDaysChange={(days) => handleChange('recurrenceMonthDays', days)}
                  onToggleWeekday={toggleWeekday}
                  onAddTimeOfDay={addTimeOfDay}
                  onUpdateTimeOfDay={updateTimeOfDay}
                  onRemoveTimeOfDay={removeTimeOfDay}
                />
              ) : null}

              {/* Hide start/due date fields when editing a series */}
              {!(mode === 'edit' && editScope === 'series') ? (
                <DateFields
                  form={form}
                  hasStart={hasStart}
                  hasDue={hasDue}
                  startFieldId={startFieldId}
                  dueFieldId={dueFieldId}
                  defaultDate={defaultDate}
                  errors={errors}
                  activeTimeZone={activeTimeZone}
                  onStartChange={(checked) => {
                    setHasStart(checked);
                    if (!checked) {
                      updateStartAt(undefined);
                      clearDateOrderError();
                    }
                  }}
                  onDueChange={(checked) => {
                    setHasDue(checked);
                    if (!checked) {
                      updateDueAt(undefined);
                      clearDateOrderError();
                    }
                  }}
                  onStartDateUpdate={updateStartAt}
                  onDueDateUpdate={updateDueAt}
                  onStartTimeUpdate={updateStartTime}
                  onDueTimeUpdate={updateDueTime}
                  onClearDateOrderError={clearDateOrderError}
                />
              ) : null}
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
                      startDate: hasStart ? (form.startDate ?? null) : null,
                      startTime: hasStart ? (form.startTime ?? null) : null,
                      dueDate: hasDue ? (form.dueDate ?? null) : null,
                      dueTime: hasDue ? (form.dueTime ?? null) : null,
                      sourceRecurringTaskId: undefined,
                      completed: false,
                    } satisfies DashboardTask
                  }
                  isProcessing={false}
                  showActions={false}
                  locale={activeLocale}
                  timeZone={activeTimeZone}
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
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            fullWidth
          >
            {mode === 'edit' ? 'Save changes' : 'Create task'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>

    {/* Confirmation Modal for Recurring → One-time Conversion */}
    <ConvertToOnetimeModal
      open={showConvertConfirm}
      pendingSubmission={pendingSubmission}
      onClose={() => {
        setShowConvertConfirm(false);
        setPendingSubmission(null);
        onClose();
      }}
      onCancel={() => {
          setShowConvertConfirm(false);
          setPendingSubmission(null);
        }}
      onSubmit={onSubmit}
      onSuccess={onClose}
    />
    </>
  );
}
