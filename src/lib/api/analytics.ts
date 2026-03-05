import { getProjectMembers } from "@pointwise/lib/api/members";
import { getProject, getUserRoleInProject } from "@pointwise/lib/api/projects";
import { getCategoryColor } from "@pointwise/lib/categories";
import prisma from "@pointwise/lib/prisma";
import type {
	AnalyticsSummary,
	CategoryBreakdownItem,
	CompletionTimeBucket,
	DayOfWeekItem,
	GetProjectAnalyticsRequest,
	GetProjectAnalyticsResponse,
	HeatmapDay,
	MemberBreakdownItem,
	TimeOfDayItem,
	TimeSeriesItem,
	TopTask,
} from "@pointwise/lib/validation/analytics-schema";
import type { Task as PrismaTask } from "@prisma/client";

type AnalyticsTask = PrismaTask & {
	taskLikes: { userId: string }[];
	commentThread: { _count: { comments: number } } | null;
};

// --- Main entry point ---

export async function getProjectAnalytics(
	projectId: string,
	userId: string,
	filters: GetProjectAnalyticsRequest,
): Promise<GetProjectAnalyticsResponse> {
	const project = await getProject(projectId, userId);
	const role = getUserRoleInProject(project, userId);

	const isAdmin = role === "ADMIN";
	const viewingOwnData = !isAdmin || filters.memberId === userId;

	// Build task query filters
	const taskWhere: Record<string, unknown> = { projectId };

	if (filters.startDate) {
		taskWhere.createdAt = {
			...(taskWhere.createdAt as Record<string, unknown>),
			gte: new Date(filters.startDate),
		};
	}
	if (filters.endDate) {
		taskWhere.createdAt = {
			...(taskWhere.createdAt as Record<string, unknown>),
			lte: new Date(filters.endDate),
		};
	}
	if (filters.category && filters.category !== "All") {
		taskWhere.category = filters.category;
	}
	if (filters.status && filters.status !== "All") {
		taskWhere.status = filters.status;
	}

	// For non-admins, scope to tasks assigned to them
	if (!isAdmin) {
		taskWhere.assignedUserIds = { has: userId };
	} else if (filters.memberId && filters.memberId !== "all") {
		taskWhere.assignedUserIds = { has: filters.memberId };
	}

	const tasks = (await prisma.task.findMany({
		where: taskWhere,
		include: {
			taskLikes: { select: { userId: true } },
			commentThread: {
				select: { _count: { select: { comments: true } } },
			},
		},
		orderBy: { createdAt: "asc" },
	})) as AnalyticsTask[];

	// Determine date range for time series
	const granularity = filters.granularity ?? "weekly";
	const startDate = filters.startDate
		? new Date(filters.startDate)
		: tasks.length > 0
			? new Date(tasks[0].createdAt)
			: new Date();
	const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

	const summary = computeSummary(tasks);
	const timeSeries = computeTimeSeries(tasks, granularity, startDate, endDate);
	const categoryBreakdown = computeCategoryBreakdown(tasks);
	const completionTimeDistribution = computeCompletionTimeDistribution(tasks);
	const dayOfWeekDistribution = computeDayOfWeekDistribution(tasks);
	const timeOfDayDistribution = computeTimeOfDayDistribution(tasks);
	const activityHeatmap = computeActivityHeatmap(tasks, startDate, endDate);
	const topTasks = computeTopTasks(tasks);

	let memberBreakdown: MemberBreakdownItem[] | null = null;
	if (isAdmin && !viewingOwnData) {
		const members = await getProjectMembers(projectId, userId);
		memberBreakdown = computeMemberBreakdown(tasks, members);
	}

	return {
		summary,
		timeSeries,
		categoryBreakdown,
		completionTimeDistribution,
		dayOfWeekDistribution,
		timeOfDayDistribution,
		activityHeatmap,
		topTasks,
		memberBreakdown,
		role,
		projectName: project.name,
	};
}

// --- Summary ---

function computeSummary(tasks: AnalyticsTask[]): AnalyticsSummary {
	const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
	const pendingTasks = tasks.filter((t) => t.status === "PENDING");
	const now = new Date();

	const overdueTasks = pendingTasks.filter(
		(t) => t.dueDate && new Date(t.dueDate) < now,
	);

	const totalXpEarned = completedTasks.reduce((sum, t) => sum + t.xpAward, 0);
	const averageTaskXp =
		completedTasks.length > 0 ? totalXpEarned / completedTasks.length : 0;

	// Completion time
	const completionTimes = completedTasks
		.filter(
			(t): t is AnalyticsTask & { completedAt: Date } => t.completedAt !== null,
		)
		.map(
			(t) =>
				(new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) /
				(1000 * 60 * 60),
		)
		.filter((h) => h >= 0);

	const averageCompletionTimeHours =
		completionTimes.length > 0
			? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
			: null;

	// Overdue rate: tasks completed after their due date
	const tasksWithDue = completedTasks.filter(
		(t): t is AnalyticsTask & { dueDate: Date; completedAt: Date } =>
			t.dueDate !== null && t.completedAt !== null,
	);
	const lateCompletions = tasksWithDue.filter(
		(t) => new Date(t.completedAt) > new Date(t.dueDate),
	);
	const overdueRate =
		tasksWithDue.length > 0
			? Math.round((lateCompletions.length / tasksWithDue.length) * 100)
			: 0;

	// Streaks
	const { current, longest } = computeStreaks(completedTasks);

	// Engagement
	const totalLikes = tasks.reduce((sum, t) => sum + t.taskLikes.length, 0);
	const totalComments = tasks.reduce(
		(sum, t) => sum + (t.commentThread?._count.comments ?? 0),
		0,
	);
	const engagementScore =
		tasks.length > 0
			? Math.round(((totalLikes + totalComments) / tasks.length) * 100) / 100
			: 0;

	return {
		totalTasks: tasks.length,
		completedTasks: completedTasks.length,
		pendingTasks: pendingTasks.length,
		completionRate:
			tasks.length > 0
				? Math.round((completedTasks.length / tasks.length) * 100)
				: 0,
		totalXpEarned,
		averageTaskXp: Math.round(averageTaskXp),
		overdueTasks: overdueTasks.length,
		averageCompletionTimeHours: averageCompletionTimeHours
			? Math.round(averageCompletionTimeHours * 10) / 10
			: null,
		overdueRate,
		currentStreak: current,
		longestStreak: longest,
		engagementScore,
	};
}

// --- Time Series ---

function computeTimeSeries(
	tasks: AnalyticsTask[],
	granularity: string,
	startDate: Date,
	endDate: Date,
): TimeSeriesItem[] {
	const buckets = generateDateBuckets(startDate, endDate, granularity);
	let cumulativeCompleted = 0;

	return buckets.map((bucketStart, i) => {
		const bucketEnd =
			i < buckets.length - 1
				? buckets[i + 1]
				: new Date(endDate.getTime() + 86400000);

		const bucketTasks = tasks.filter((t) => {
			const created = new Date(t.createdAt);
			return created >= bucketStart && created < bucketEnd;
		});

		const completedInBucket = tasks.filter((t) => {
			if (!t.completedAt) return false;
			const completed = new Date(t.completedAt);
			return completed >= bucketStart && completed < bucketEnd;
		});

		cumulativeCompleted += completedInBucket.length;

		const overdueInBucket = tasks.filter((t) => {
			if (!t.dueDate || t.status !== "PENDING") return false;
			const due = new Date(t.dueDate);
			return due >= bucketStart && due < bucketEnd && due < new Date();
		});

		const likes = completedInBucket.reduce(
			(sum, t) => sum + t.taskLikes.length,
			0,
		);
		const comments = completedInBucket.reduce(
			(sum, t) => sum + (t.commentThread?._count.comments ?? 0),
			0,
		);

		return {
			date: bucketStart.toISOString().split("T")[0],
			tasksCompleted: completedInBucket.length,
			tasksCreated: bucketTasks.length,
			cumulativeCompleted,
			xpEarned: completedInBucket.reduce((sum, t) => sum + t.xpAward, 0),
			overdueCount: overdueInBucket.length,
			likesReceived: likes,
			commentsReceived: comments,
		};
	});
}

function generateDateBuckets(
	start: Date,
	end: Date,
	granularity: string,
): Date[] {
	const buckets: Date[] = [];
	const current = new Date(start);
	current.setHours(0, 0, 0, 0);

	if (granularity === "weekly") {
		// Align to start of week (Monday)
		const day = current.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		current.setDate(current.getDate() + diff);
	} else if (granularity === "monthly") {
		current.setDate(1);
	}

	while (current <= end) {
		buckets.push(new Date(current));
		if (granularity === "daily") {
			current.setDate(current.getDate() + 1);
		} else if (granularity === "weekly") {
			current.setDate(current.getDate() + 7);
		} else {
			current.setMonth(current.getMonth() + 1);
		}
	}

	return buckets;
}

// --- Category Breakdown ---

function computeCategoryBreakdown(
	tasks: AnalyticsTask[],
): CategoryBreakdownItem[] {
	const categoryMap = new Map<
		string,
		{ total: number; completed: number; xp: number; completionTimes: number[] }
	>();

	for (const task of tasks) {
		const cat = task.category || "Uncategorized";
		const entry = categoryMap.get(cat) ?? {
			total: 0,
			completed: 0,
			xp: 0,
			completionTimes: [],
		};

		entry.total++;
		if (task.status === "COMPLETED") {
			entry.completed++;
			entry.xp += task.xpAward;
			if (task.completedAt) {
				const hours =
					(new Date(task.completedAt).getTime() -
						new Date(task.createdAt).getTime()) /
					(1000 * 60 * 60);
				if (hours >= 0) {
					entry.completionTimes.push(hours);
				}
			}
		}
		categoryMap.set(cat, entry);
	}

	return Array.from(categoryMap.entries()).map(([category, data]) => ({
		category,
		totalTasks: data.total,
		completedTasks: data.completed,
		totalXp: data.xp,
		averageCompletionTimeHours:
			data.completionTimes.length > 0
				? Math.round(
						(data.completionTimes.reduce((a, b) => a + b, 0) /
							data.completionTimes.length) *
							10,
					) / 10
				: null,
		color: getCategoryColor(category),
	}));
}

// --- Completion Time Distribution ---

function computeCompletionTimeDistribution(
	tasks: AnalyticsTask[],
): CompletionTimeBucket[] {
	const bucketDefs = [
		{ label: "< 1 day", maxHours: 24 },
		{ label: "1-3 days", maxHours: 72 },
		{ label: "3-7 days", maxHours: 168 },
		{ label: "1-2 weeks", maxHours: 336 },
		{ label: "2+ weeks", maxHours: Number.POSITIVE_INFINITY },
	];

	const counts = new Array(bucketDefs.length).fill(0);

	for (const task of tasks) {
		if (task.status !== "COMPLETED" || !task.completedAt) continue;
		const hours =
			(new Date(task.completedAt).getTime() -
				new Date(task.createdAt).getTime()) /
			(1000 * 60 * 60);
		if (hours < 0) continue;

		for (let i = 0; i < bucketDefs.length; i++) {
			if (hours < bucketDefs[i].maxHours) {
				counts[i]++;
				break;
			}
		}
	}

	return bucketDefs.map((def, i) => ({
		bucket: def.label,
		count: counts[i],
	}));
}

// --- Day of Week ---

function computeDayOfWeekDistribution(tasks: AnalyticsTask[]): DayOfWeekItem[] {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const counts = new Array(7).fill(0);

	for (const task of tasks) {
		if (!task.completedAt) continue;
		const day = new Date(task.completedAt).getDay();
		counts[day]++;
	}

	// Return starting from Monday
	const ordered = [1, 2, 3, 4, 5, 6, 0];
	return ordered.map((i) => ({ day: days[i], count: counts[i] }));
}

// --- Time of Day ---

function computeTimeOfDayDistribution(tasks: AnalyticsTask[]): TimeOfDayItem[] {
	const counts = new Array(24).fill(0);

	for (const task of tasks) {
		if (!task.completedAt) continue;
		const hour = new Date(task.completedAt).getHours();
		counts[hour]++;
	}

	return counts.map((count, hour) => ({ hour, count }));
}

// --- Activity Heatmap ---

function computeActivityHeatmap(
	tasks: AnalyticsTask[],
	startDate: Date,
	endDate: Date,
): HeatmapDay[] {
	const completionMap = new Map<string, number>();

	for (const task of tasks) {
		if (!task.completedAt) continue;
		const dateStr = new Date(task.completedAt).toISOString().split("T")[0];
		completionMap.set(dateStr, (completionMap.get(dateStr) ?? 0) + 1);
	}

	// Generate all days in range
	const days: HeatmapDay[] = [];
	const current = new Date(startDate);
	current.setHours(0, 0, 0, 0);

	while (current <= endDate) {
		const dateStr = current.toISOString().split("T")[0];
		days.push({ date: dateStr, count: completionMap.get(dateStr) ?? 0 });
		current.setDate(current.getDate() + 1);
	}

	return days;
}

// --- Top Tasks ---

function computeTopTasks(tasks: AnalyticsTask[]): TopTask[] {
	return tasks
		.map((t) => ({
			taskId: t.id,
			title: t.title,
			likeCount: t.taskLikes.length,
			commentCount: t.commentThread?._count.comments ?? 0,
			xpAward: t.xpAward,
		}))
		.sort(
			(a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount),
		)
		.slice(0, 10);
}

// --- Streaks ---

function computeStreaks(completedTasks: AnalyticsTask[]): {
	current: number;
	longest: number;
} {
	const completedDates = new Set<string>();

	for (const task of completedTasks) {
		if (!task.completedAt) continue;
		completedDates.add(new Date(task.completedAt).toISOString().split("T")[0]);
	}

	if (completedDates.size === 0) return { current: 0, longest: 0 };

	const sortedDates = Array.from(completedDates).sort();

	let longest = 1;
	let currentRun = 1;

	for (let i = 1; i < sortedDates.length; i++) {
		const prev = new Date(sortedDates[i - 1]);
		const curr = new Date(sortedDates[i]);
		const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

		if (diffDays === 1) {
			currentRun++;
			longest = Math.max(longest, currentRun);
		} else {
			currentRun = 1;
		}
	}

	// Compute current streak (must include today or yesterday)
	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
	const lastDate = sortedDates[sortedDates.length - 1];

	let current = 0;
	if (lastDate === today || lastDate === yesterday) {
		current = 1;
		for (let i = sortedDates.length - 2; i >= 0; i--) {
			const prev = new Date(sortedDates[i]);
			const next = new Date(sortedDates[i + 1]);
			const diffDays =
				(next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
			if (diffDays === 1) {
				current++;
			} else {
				break;
			}
		}
	}

	return { current, longest };
}

// --- Member Breakdown ---

function computeMemberBreakdown(
	tasks: AnalyticsTask[],
	members: { userId: string; displayName: string; image: string | null }[],
): MemberBreakdownItem[] {
	return members.map((member) => {
		const memberTasks = tasks.filter((t) =>
			t.assignedUserIds.includes(member.userId),
		);
		const completedTasks = memberTasks.filter((t) => t.status === "COMPLETED");
		const totalXpEarned = completedTasks.reduce((sum, t) => sum + t.xpAward, 0);

		const completionTimes = completedTasks
			.filter(
				(t): t is AnalyticsTask & { completedAt: Date } =>
					t.completedAt !== null,
			)
			.map(
				(t) =>
					(new Date(t.completedAt).getTime() -
						new Date(t.createdAt).getTime()) /
					(1000 * 60 * 60),
			)
			.filter((h) => h >= 0);

		const avgTime =
			completionTimes.length > 0
				? Math.round(
						(completionTimes.reduce((a, b) => a + b, 0) /
							completionTimes.length) *
							10,
					) / 10
				: null;

		const { current } = computeStreaks(completedTasks);

		return {
			userId: member.userId,
			displayName: member.displayName,
			image: member.image,
			tasksCompleted: completedTasks.length,
			totalXpEarned,
			completionRate:
				memberTasks.length > 0
					? Math.round((completedTasks.length / memberTasks.length) * 100)
					: 0,
			averageCompletionTimeHours: avgTime,
			currentStreak: current,
		};
	});
}
