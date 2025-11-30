'use client';

import { useMemo } from 'react';
import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import type { TaskBoardViewMode } from '@pointwise/app/components/dashboard/task-board/types';
import {
  addDays,
  formatDateLabel,
  getDateTimeParts,
  startOfDay,
  toDate,
  toDateKey,
} from '@pointwise/lib/datetime';

export function useTaskFilters(
  tasks: DashboardTask[],
  selectedDate: Date,
  locale: string,
  timeZone: string,
  referenceTimestamp: number,
  viewMode: TaskBoardViewMode = 'day',
) {
  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );
  // Calculate date range based on view mode
  const { rangeStart, rangeEnd } = useMemo(() => {
    const baseStart = startOfDay(selectedDate, timeZone);

    if (viewMode === 'day') {
      return {
        rangeStart: baseStart,
        rangeEnd: addDays(baseStart, 1, timeZone),
      };
    }

    if (viewMode === 'week') {
      // 7 days starting from selected date (like Analytics 7d)
      return {
        rangeStart: baseStart,
        rangeEnd: addDays(baseStart, 7, timeZone),
      };
    }

    // viewMode === 'month' - 30 days starting from selected date (like Analytics 30d)
    return {
      rangeStart: baseStart,
      rangeEnd: addDays(baseStart, 30, timeZone),
    };
  }, [selectedDate, timeZone, viewMode]);

  const scheduledTasks = useMemo(() => {
    const rangeStartMs = rangeStart.getTime();
    const rangeEndMs = rangeEnd.getTime();
    return stableTasks.filter((task) => {
      if (task.completed) return false;
      const rawStart = toDate(task.startAt);
      const rawEnd = toDate(task.dueAt);
      if (!rawStart && !rawEnd) return false;

      const taskStartMs =
        rawStart?.getTime() ?? rawEnd?.getTime() ?? Number.NEGATIVE_INFINITY;
      const taskEndMs =
        rawEnd?.getTime() ??
        (rawStart ? rawStart.getTime() : Number.POSITIVE_INFINITY);

      // Task overlaps with range if:
      // - Task starts before range ends AND
      // - Task ends after range starts
      if (taskStartMs >= rangeEndMs) return false;
      if (taskEndMs < rangeStartMs) return false;

      return true;
    });
  }, [rangeStart, rangeEnd, stableTasks]);

  const optionalTasks = useMemo(
    () =>
      stableTasks.filter(
        (task) => !task.completed && !task.startAt && !task.dueAt,
      ),
    [stableTasks],
  );

  const overdueTasks = useMemo(() => {
    return stableTasks
      .filter((task) => {
        if (task.completed) return false;
        const due = toDate(task.dueAt);
        if (!due) return false;
        return due.getTime() < referenceTimestamp;
      })
      .sort((a, b) => {
        const aDue = toDate(a.dueAt)!.getTime();
        const bDue = toDate(b.dueAt)!.getTime();
        return aDue - bDue;
      });
  }, [referenceTimestamp, stableTasks]);

  const selectedDateLabel = useMemo(() => {
    if (viewMode === 'day') {
      return formatDateLabel(selectedDate, locale, timeZone);
    }

    if (viewMode === 'week') {
      const endDate = addDays(rangeStart, 6, timeZone);
      // Format dates without weekday for cleaner range display
      const startParts = getDateTimeParts(rangeStart, timeZone);
      const endParts = getDateTimeParts(endDate, timeZone);
      const formatter = new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        timeZone,
      });
      const startFormatted = formatter.format(
        new Date(
          Date.UTC(startParts.year, startParts.month - 1, startParts.day),
        ),
      );
      const endFormatted = formatter.format(
        new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day)),
      );
      return `${startFormatted} - ${endFormatted}`;
    }

    // viewMode === 'month' - 30 days, show range
    const endDate = addDays(rangeStart, 29, timeZone);
    const startParts = getDateTimeParts(rangeStart, timeZone);
    const endParts = getDateTimeParts(endDate, timeZone);
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      timeZone,
    });
    const startFormatted = formatter.format(
      new Date(Date.UTC(startParts.year, startParts.month - 1, startParts.day)),
    );
    const endFormatted = formatter.format(
      new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day)),
    );
    return `${startFormatted} - ${endFormatted}`;
  }, [selectedDate, rangeStart, locale, timeZone, viewMode]);

  const selectedDateInputValue = useMemo(
    () => toDateKey(selectedDate, timeZone),
    [selectedDate, timeZone],
  );

  return {
    scheduledTasks,
    optionalTasks,
    overdueTasks,
    selectedDateLabel,
    selectedDateInputValue,
  };
}
