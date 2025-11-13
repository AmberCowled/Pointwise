'use client';

import { useMemo } from 'react';
import type { DashboardTask } from '../app/components/dashboard/TaskList';
import {
  buildXpSeries,
  buildFocusSeries,
  buildCategoryBreakdown,
  getPeakFocusHour,
  type AnalyticsRange,
} from '@pointwise/lib/analytics';
import { buildCategoryGradient } from '@pointwise/lib/categories';

export default function useAnalyticsSeries(
  tasks: DashboardTask[],
  range: AnalyticsRange,
) {
  const stableTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );

  const xpSeries = useMemo(
    () => buildXpSeries(stableTasks, range),
    [stableTasks, range],
  );

  const totalXpInRange = useMemo(
    () => xpSeries.reduce((sum, point) => sum + point.value, 0),
    [xpSeries],
  );

  const focusSeries = useMemo(
    () => buildFocusSeries(stableTasks, range),
    [stableTasks, range],
  );

  const peakFocusHour = useMemo(
    () => getPeakFocusHour(focusSeries),
    [focusSeries],
  );

  const categoryStats = useMemo(
    () => buildCategoryBreakdown(stableTasks, range),
    [stableTasks, range],
  );

  const categoryBreakdown = categoryStats.slices;
  const customCategoryBreakdown = categoryStats.customSlices;

  const categoryGradient = useMemo(
    () => buildCategoryGradient(categoryBreakdown),
    [categoryBreakdown],
  );

  const totalCategoryCount = useMemo(
    () => categoryBreakdown.reduce((sum, slice) => sum + slice.value, 0),
    [categoryBreakdown],
  );

  return {
    xpSeries,
    totalXpInRange,
    focusSeries,
    peakFocusHour,
    categoryBreakdown,
    customCategoryBreakdown,
    categoryGradient,
    totalCategoryCount,
  };
}
