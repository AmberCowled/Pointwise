/**
 * Hook for generating recurring task instances on-demand
 */

import { useMemo } from 'react';
import type { DashboardTask } from '@pointwise/app/components/dashboard/tasks/TaskList';
import {
  generateRecurringInstances,
  mergeTemplatesWithInstances,
} from '@pointwise/lib/tasks/generate-instances';

export interface UseRecurringTaskInstancesOptions {
  tasks: DashboardTask[];
  dateRange: { start: Date; end: Date };
  userTimeZone: string;
}

/**
 * Hook that generates recurring task instances from templates
 * 
 * @param options - Configuration for instance generation
 * @returns Array of tasks with templates replaced by their generated instances
 */
export function useRecurringTaskInstances({
  tasks,
  dateRange,
  userTimeZone,
}: UseRecurringTaskInstancesOptions): DashboardTask[] {
  return useMemo(() => {
    return mergeTemplatesWithInstances(tasks, dateRange, userTimeZone);
  }, [tasks, dateRange.start, dateRange.end, userTimeZone]);
}

/**
 * Hook that generates instances for a single template task
 * 
 * @param template - The recurring task template
 * @param dateRange - Date range to generate instances for
 * @param userTimeZone - User's timezone
 * @param existingInstances - Existing instances from database
 * @returns Array of generated instances
 */
export function useTemplateInstances(
  template: DashboardTask | null,
  dateRange: { start: Date; end: Date },
  userTimeZone: string,
  existingInstances: DashboardTask[] = [],
): DashboardTask[] {
  return useMemo(() => {
    if (!template || !template.recurrencePattern || template.isRecurringInstance) {
      return [];
    }

    return generateRecurringInstances(
      template,
      dateRange,
      userTimeZone,
      existingInstances,
    );
  }, [template, dateRange.start, dateRange.end, userTimeZone, existingInstances]);
}

