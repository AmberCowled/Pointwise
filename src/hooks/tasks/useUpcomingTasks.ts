'use client';

import { useMemo } from 'react';
import { startOfDay } from '@pointwise/lib/datetime';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';

export interface UseUpcomingTasksOptions {
  tasks: DashboardTask[];
  scheduledTasks: DashboardTask[];
  timeZone: string;
}

export interface UseUpcomingTasksReturn {
  upcomingTasks: DashboardTask[];
}

/**
 * Hook for calculating upcoming tasks
 * 
 * Filters tasks that:
 * - Are not completed
 * - Are not already in scheduled tasks
 * - Have a due date or start date after today
 * 
 * Sorts by date (earliest first)
 */
export function useUpcomingTasks(
  options: UseUpcomingTasksOptions,
): UseUpcomingTasksReturn {
  const { tasks, scheduledTasks, timeZone } = options;

  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date(), timeZone);
    const scheduledTaskIds = new Set(scheduledTasks.map((task) => task.id));
    
    return tasks
      .filter((task) => {
        if (task.completed) return false;
        // Exclude tasks already in scheduled tasks
        if (scheduledTaskIds.has(task.id)) return false;
        // Combine date and time for upcoming check
        let taskDate: Date | null = null;
        if (task.dueDate && task.dueTime) {
          taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
        } else if (task.dueDate) {
          taskDate = new Date(`${task.dueDate}T23:59:59`);
        } else if (task.startDate && task.startTime) {
          taskDate = new Date(`${task.startDate}T${task.startTime}`);
        } else if (task.startDate) {
          taskDate = new Date(`${task.startDate}T00:00:00`);
        }

        if (!taskDate) return false;
        return taskDate > today;
      })
      .sort((a, b) => {
        const getTaskDate = (task: typeof a) => {
          if (task.dueDate && task.dueTime) {
            return new Date(`${task.dueDate}T${task.dueTime}`);
          } else if (task.dueDate) {
            return new Date(`${task.dueDate}T23:59:59`);
          } else if (task.startDate && task.startTime) {
            return new Date(`${task.startDate}T${task.startTime}`);
          } else if (task.startDate) {
            return new Date(`${task.startDate}T00:00:00`);
          }
          return null;
        };

        const dateA = getTaskDate(a);
        const dateB = getTaskDate(b);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
  }, [tasks, scheduledTasks, timeZone]);

  return {
    upcomingTasks,
  };
}

