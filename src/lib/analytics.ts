import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import { addDays, startOfDay, toDate, toDateKey } from './datetime';

export const ANALYTICS_TAB_LABELS = {
  xp: 'XP Trend',
  focus: 'Focus Tracker',
  categories: 'Category Breakdown',
} as const;

export const ANALYTICS_RANGE_LABELS = {
  '1d': 'Past day',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
} as const;

export type AnalyticsTab = keyof typeof ANALYTICS_TAB_LABELS;
export type AnalyticsRange = keyof typeof ANALYTICS_RANGE_LABELS;

export type LineDataPoint = {
  label: string;
  value: number;
};

export type CategorySlice = {
  category: string;
  value: number;
  percentage: number;
  color: string;
};

export type ChartPoint = {
  x: number;
  y: number;
};

const CATEGORY_COLORS = [
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#22d3ee',
  '#10b981',
];

const SHORT_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function buildXpSeries(tasks: DashboardTask[], range: AnalyticsRange) {
  const { start, end, days } = getAnalyticsWindow(range);

  if (range === '1d') {
    const buckets = new Array(24).fill(0);
    for (const task of tasks) {
      if (!task.completed) continue;
      const completedAt = getEffectiveCompletionDate(task);
      if (!completedAt) continue;
      if (completedAt < start || completedAt > end) continue;
      buckets[completedAt.getHours()] += task.xp ?? 0;
    }
    return buckets.map((value, hour) => ({
      label: formatHourLabel(hour),
      value,
    }));
  }

  const totals = new Map<string, number>();
  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    const key = toDateKey(startOfDay(completedAt));
    totals.set(key, (totals.get(key) ?? 0) + (task.xp ?? 0));
  }

  const series: LineDataPoint[] = [];
  for (let index = 0; index < days; index += 1) {
    const date = addDays(start, index);
    const key = toDateKey(date);
    series.push({
      label: formatShortDayLabel(date),
      value: totals.get(key) ?? 0,
    });
  }
  return series;
}

export function buildFocusSeries(
  tasks: DashboardTask[],
  range: AnalyticsRange,
) {
  const { start, end } = getAnalyticsWindow(range);
  const buckets = new Array(24).fill(0);
  const dayKeys = new Set<string>();

  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    buckets[completedAt.getHours()] += task.xp ?? 0;
    dayKeys.add(toDateKey(startOfDay(completedAt)));
  }

  const divisor = Math.max(1, dayKeys.size || (range === '1d' ? 1 : 0));

  return buckets.map((value, hour) => ({
    label: formatHourLabel(hour),
    value: divisor > 0 ? value / divisor : 0,
  }));
}

export function getPeakFocusHour(series: LineDataPoint[]) {
  if (!series.length) return null;
  return series.reduce<LineDataPoint | null>((best, point) => {
    if (!best || point.value > best.value) return point;
    return best;
  }, null);
}

export function buildCategoryBreakdown(
  tasks: DashboardTask[],
  range: AnalyticsRange,
) {
  const { start, end } = getAnalyticsWindow(range);
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!task.completed) continue;
    const completedAt = getEffectiveCompletionDate(task);
    if (!completedAt) continue;
    if (completedAt < start || completedAt > end) continue;
    const key = (task.category ?? 'Uncategorized').trim() || 'Uncategorized';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total === 0) return [];
  return entries.map(([category, value], index) => ({
    category,
    value,
    percentage: value / total,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

export function buildCategoryGradient(slices: CategorySlice[]) {
  if (!slices.length) return null;
  let cumulative = 0;
  const segments: string[] = [];
  for (const slice of slices) {
    const start = cumulative * 360;
    cumulative += slice.percentage;
    const end = cumulative * 360;
    segments.push(`${slice.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  }
  return `conic-gradient(${segments.join(', ')})`;
}

export function getAnalyticsWindow(range: AnalyticsRange) {
  const end = new Date();
  const todayStart = startOfDay(end);
  const days = range === '1d' ? 1 : range === '7d' ? 7 : 30;
  const start = addDays(todayStart, -(days - 1));
  return { start, end, days };
}

export function getEffectiveCompletionDate(task: DashboardTask) {
  const completion = toDate(task.completedAt);
  if (completion) return completion;
  const due = toDate(task.dueAt);
  if (due) return due;
  const start = toDate(task.startAt);
  return start;
}

export function formatShortDayLabel(date: Date) {
  return SHORT_DAY_FORMATTER.format(date);
}

export function formatHourLabel(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

export function createSmoothPath(points: ChartPoint[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = previous.x + (current.x - previous.x) / 2;
    path += ` C ${controlX} ${previous.y} ${controlX} ${current.y} ${current.x} ${current.y}`;
  }
  return path;
}

export function createAreaPath(
  points: ChartPoint[],
  chartHeight: number,
  bottomPadding: number,
) {
  if (!points.length) return '';
  const baseline = chartHeight - bottomPadding;
  if (points.length === 1) {
    const [point] = points;
    return `M ${point.x} ${baseline} L ${point.x} ${point.y} L ${point.x + 0.001} ${baseline} Z`;
  }
  let path = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = previous.x + (current.x - previous.x) / 2;
    path += ` C ${controlX} ${previous.y} ${controlX} ${current.y} ${current.x} ${current.y}`;
  }
  path += ` L ${points[points.length - 1].x} ${baseline} Z`;
  return path;
}
