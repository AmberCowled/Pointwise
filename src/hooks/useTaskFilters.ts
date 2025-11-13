'use client';

import { useMemo } from 'react';
import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import {
  addDays,
  formatDateLabel,
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
) {
  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );
  const scheduledTasks = useMemo(() => {
    const dayStart = startOfDay(selectedDate, timeZone);
    const dayEnd = addDays(dayStart, 1, timeZone);
    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayEnd.getTime();
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

      if (taskStartMs >= dayEndMs) return false;
      if (taskEndMs < dayStartMs) return false;

      return true;
    });
  }, [selectedDate, stableTasks, timeZone]);

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

  const selectedDateLabel = useMemo(
    () => formatDateLabel(selectedDate, locale, timeZone),
    [locale, selectedDate, timeZone],
  );

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
