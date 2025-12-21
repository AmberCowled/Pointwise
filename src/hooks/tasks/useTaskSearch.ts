"use client";

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { useMemo } from "react";

export interface UseTaskSearchOptions {
  tasks: DashboardTask[];
  searchQuery: string;
}

export interface UseTaskSearchReturn {
  filteredTasks: DashboardTask[];
}

/**
 * Hook for filtering tasks by search query
 *
 * Searches across:
 * - Task title
 * - Task category
 * - Task context/notes
 *
 * Case-insensitive, partial match
 */
export function useTaskSearch(
  options: UseTaskSearchOptions,
): UseTaskSearchReturn {
  const { tasks, searchQuery } = options;

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.toLowerCase().trim();
    return tasks.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(query) ?? false;
      const categoryMatch =
        task.category?.toLowerCase().includes(query) ?? false;
      const contextMatch = task.context?.toLowerCase().includes(query) ?? false;
      return titleMatch || categoryMatch || contextMatch;
    });
  }, [tasks, searchQuery]);

  return {
    filteredTasks,
  };
}
