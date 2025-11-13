'use client';

import { useMemo, useState } from 'react';
import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import {
  formatDateLabel,
  startOfDay,
  toDate,
  toDateKey,
} from '@pointwise/lib/datetime';

export function useTaskFilters(tasks: DashboardTask[], selectedDate: Date) {
  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );
  const [referenceTime] = useState(() => Date.now());
  const scheduledTasks = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayKey = dayStart.getTime();
    return stableTasks.filter((task) => {
      if (task.completed) return false;
      const rawStart = toDate(task.startAt);
      const rawEnd = toDate(task.dueAt);
      const start = rawStart
        ? startOfDay(rawStart)
        : rawEnd
          ? startOfDay(rawEnd)
          : null;
      const end = rawEnd
        ? startOfDay(rawEnd)
        : rawStart && !task.completed
          ? null
          : start;
      if (!start && !end) return false;
      const startTime = start?.getTime() ?? Number.NEGATIVE_INFINITY;
      const endTime = end ? end.getTime() : Number.POSITIVE_INFINITY;
      return startTime <= dayKey && endTime >= dayKey;
    });
  }, [selectedDate, stableTasks]);

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
        return due.getTime() < referenceTime;
      })
      .sort((a, b) => {
        const aDue = toDate(a.dueAt)!.getTime();
        const bDue = toDate(b.dueAt)!.getTime();
        return aDue - bDue;
      });
  }, [referenceTime, stableTasks]);

  const selectedDateLabel = useMemo(
    () => formatDateLabel(selectedDate),
    [selectedDate],
  );

  const selectedDateInputValue = useMemo(
    () => toDateKey(selectedDate),
    [selectedDate],
  );

  return {
    scheduledTasks,
    optionalTasks,
    overdueTasks,
    selectedDateLabel,
    selectedDateInputValue,
  };
}
