'use client';

import { useMemo } from 'react';
import type { DashboardTask } from '../app/components/dashboard/tasks/TaskList';
import {
  buildAnalyticsSnapshot,
  type AnalyticsRange,
} from '@pointwise/lib/analytics';

export default function useAnalyticsSeries(
  tasks: DashboardTask[],
  range: AnalyticsRange,
  locale: string,
  timeZone: string,
) {
  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );

  return useMemo(
    () => buildAnalyticsSnapshot(stableTasks, range, locale, timeZone),
    [locale, range, stableTasks, timeZone],
  );
}
