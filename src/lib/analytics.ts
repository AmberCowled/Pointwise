import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import {
	buildCategoryGradient,
	type CategoryBreakdownResult,
	createCategorySlices,
	normalizeCoreTaskCategory,
} from "./categories";
import {
	addDays,
	DateTimeDefaults,
	getDateTimeParts,
	startOfDay,
	toDate,
	toDateKey,
} from "./datetime";

export type { CategoryBreakdownResult, CategorySlice } from "./categories";

export const ANALYTICS_TAB_LABELS = {
	xp: "XP Trend",
	focus: "Focus Tracker",
	categories: "Category Breakdown",
} as const;

export const ANALYTICS_RANGE_LABELS = {
	"1d": "Past day",
	"7d": "Last 7 days",
	"30d": "Last 30 days",
} as const;

export type AnalyticsTab = keyof typeof ANALYTICS_TAB_LABELS;
export type AnalyticsRange = keyof typeof ANALYTICS_RANGE_LABELS;

export type LineDataPoint = {
	label: string;
	value: number;
};

export type ChartPoint = {
	x: number;
	y: number;
};

export type AnalyticsSnapshot = {
	xpSeries: LineDataPoint[];
	totalXpInRange: number;
	focusSeries: LineDataPoint[];
	peakFocusHour: LineDataPoint | null;
	categoryBreakdown: CategoryBreakdownResult["slices"];
	customCategoryBreakdown: CategoryBreakdownResult["customSlices"];
	categoryGradient: string | null;
	totalCategoryCount: number;
};

export function buildXpSeries(
	tasks: DashboardTask[],
	range: AnalyticsRange,
	locale: string = DateTimeDefaults.locale,
	timeZone: string = DateTimeDefaults.timeZone,
) {
	const { start, end, days } = getAnalyticsWindow(range, timeZone);

	if (range === "1d") {
		const buckets = new Array(24).fill(0);
		for (const task of tasks) {
			if (!task.completed) continue;
			const completedAt = getEffectiveCompletionDate(task);
			if (!completedAt) continue;
			if (completedAt < start || completedAt >= end) continue;
			const parts = getDateTimeParts(completedAt, timeZone);
			buckets[parts.hour] += task.xp ?? 0;
		}
		return buckets.map((value, hour) => ({
			label: formatHourTick(hour),
			value,
		}));
	}

	const totals = new Map<string, number>();
	for (const task of tasks) {
		if (!task.completed) continue;
		const completedAt = getEffectiveCompletionDate(task);
		if (!completedAt) continue;
		if (completedAt < start || completedAt >= end) continue;
		const key = toDateKey(startOfDay(completedAt, timeZone), timeZone);
		totals.set(key, (totals.get(key) ?? 0) + (task.xp ?? 0));
	}

	const series: LineDataPoint[] = [];
	for (let index = 0; index < days; index += 1) {
		const date = addDays(start, index, timeZone);
		const key = toDateKey(date, timeZone);
		series.push({
			label: formatShortDayLabel(date, locale, timeZone),
			value: totals.get(key) ?? 0,
		});
	}
	return series;
}

export function buildFocusSeries(
	tasks: DashboardTask[],
	range: AnalyticsRange,
	locale: string = DateTimeDefaults.locale,
	timeZone: string = DateTimeDefaults.timeZone,
) {
	void locale;
	const { start, end } = getAnalyticsWindow(range, timeZone);
	const buckets = new Array(24).fill(0);
	const dayKeys = new Set<string>();

	for (const task of tasks) {
		if (!task.completed) continue;
		const completedAt = getEffectiveCompletionDate(task);
		if (!completedAt) continue;
		if (completedAt < start || completedAt >= end) continue;
		const parts = getDateTimeParts(completedAt, timeZone);
		buckets[parts.hour] += task.xp ?? 0;
		dayKeys.add(toDateKey(startOfDay(completedAt, timeZone), timeZone));
	}

	const divisor = Math.max(1, dayKeys.size || (range === "1d" ? 1 : 0));

	return buckets.map((value, hour) => ({
		label: formatHourTick(hour),
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
	timeZone: string = DateTimeDefaults.timeZone,
): CategoryBreakdownResult {
	const { start, end } = getAnalyticsWindow(range, timeZone);
	const coreCounts = new Map<string, number>();
	const customCounts = new Map<string, number>();

	for (const task of tasks) {
		if (!task.completed) continue;
		const completedAt = getEffectiveCompletionDate(task);
		if (!completedAt) continue;
		if (completedAt < start || completedAt >= end) continue;

		const rawCategory = (task.category ?? "").trim();
		const fallback = "Uncategorized";
		const resolvedCore = normalizeCoreTaskCategory(rawCategory);
		if (resolvedCore) {
			coreCounts.set(resolvedCore, (coreCounts.get(resolvedCore) ?? 0) + 1);
		} else {
			const label = rawCategory || fallback;
			customCounts.set(label, (customCounts.get(label) ?? 0) + 1);
		}
	}

	const coreEntries = Array.from(coreCounts.entries()).sort((a, b) => b[1] - a[1]);
	const customEntries = Array.from(customCounts.entries()).sort((a, b) => b[1] - a[1]);

	return createCategorySlices(coreEntries, customEntries);
}

export { buildCategoryGradient } from "./categories";

export function getAnalyticsWindow(
	range: AnalyticsRange,
	timeZone: string = DateTimeDefaults.timeZone,
) {
	const now = new Date();
	const todayStart = startOfDay(now, timeZone);
	const days = range === "1d" ? 1 : range === "7d" ? 7 : 30;
	const start = addDays(todayStart, -(days - 1), timeZone);
	const exclusiveEnd = addDays(todayStart, 1, timeZone);
	return { start, end: exclusiveEnd, days };
}

export function getEffectiveCompletionDate(task: DashboardTask) {
	const completion = toDate(task.completedAt);
	if (completion) return completion;

	// Check due date/time
	if (task.dueDate && task.dueTime) {
		return new Date(`${task.dueDate}T${task.dueTime}`);
	} else if (task.dueDate) {
		return new Date(`${task.dueDate}T23:59:59`);
	}

	// Check start date/time
	if (task.startDate && task.startTime) {
		return new Date(`${task.startDate}T${task.startTime}`);
	} else if (task.startDate) {
		return new Date(`${task.startDate}T00:00:00`);
	}

	return null;
}

export function formatShortDayLabel(
	date: Date,
	locale: string = DateTimeDefaults.locale,
	timeZone: string = DateTimeDefaults.timeZone,
) {
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		day: "numeric",
		timeZone,
	}).format(date);
}

export function formatHourLabel(
	hour: number,
	locale: string = DateTimeDefaults.locale,
	timeZone: string = DateTimeDefaults.timeZone,
) {
	const reference = new Date(Date.UTC(2020, 0, 1, hour, 0, 0));
	return new Intl.DateTimeFormat(locale, {
		hour: "numeric",
		hour12: true,
		timeZone,
	}).format(reference);
}

function formatHourTick(hour24: number) {
	const normalized = ((hour24 % 24) + 24) % 24;
	const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
	const period = normalized >= 12 ? "PM" : "AM";
	return `${hour12}${period}`;
}

export function buildAnalyticsSnapshot(
	tasks: DashboardTask[],
	range: AnalyticsRange,
	locale: string = DateTimeDefaults.locale,
	timeZone: string = DateTimeDefaults.timeZone,
): AnalyticsSnapshot {
	const xpSeries = buildXpSeries(tasks, range, locale, timeZone);
	const totalXpInRange = xpSeries.reduce((sum, point) => sum + point.value, 0);
	const focusSeries = buildFocusSeries(tasks, range, locale, timeZone);
	const peakFocusHour = getPeakFocusHour(focusSeries);
	const categoryStats = buildCategoryBreakdown(tasks, range, timeZone);
	const categoryGradient = buildCategoryGradient(categoryStats.slices);
	const totalCategoryCount = categoryStats.slices.reduce((sum, slice) => sum + slice.value, 0);

	return {
		xpSeries,
		totalXpInRange,
		focusSeries,
		peakFocusHour,
		categoryBreakdown: categoryStats.slices,
		customCategoryBreakdown: categoryStats.customSlices,
		categoryGradient,
		totalCategoryCount,
	};
}

export { createAreaPath, createSmoothPath } from "./charts";
