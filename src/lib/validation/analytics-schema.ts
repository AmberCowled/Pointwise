import { z } from "zod";

// --- Request Schemas ---

export const GetProjectAnalyticsRequestSchema = z.object({
	projectId: z.string(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	category: z.string().optional(),
	status: z.enum(["All", "PENDING", "COMPLETED"]).optional(),
	memberId: z.string().optional(),
	granularity: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export type GetProjectAnalyticsRequest = z.infer<
	typeof GetProjectAnalyticsRequestSchema
>;

// --- Response Sub-Schemas ---

const SummarySchema = z.object({
	totalTasks: z.number(),
	completedTasks: z.number(),
	pendingTasks: z.number(),
	completionRate: z.number(),
	totalXpEarned: z.number(),
	averageTaskXp: z.number(),
	overdueTasks: z.number(),
	averageCompletionTimeHours: z.number().nullable(),
	overdueRate: z.number(),
	currentStreak: z.number(),
	longestStreak: z.number(),
	engagementScore: z.number(),
});

const TimeSeriesItemSchema = z.object({
	date: z.string(),
	tasksCompleted: z.number(),
	tasksCreated: z.number(),
	cumulativeCompleted: z.number(),
	xpEarned: z.number(),
	overdueCount: z.number(),
	likesReceived: z.number(),
	commentsReceived: z.number(),
});

const CategoryBreakdownItemSchema = z.object({
	category: z.string(),
	totalTasks: z.number(),
	completedTasks: z.number(),
	totalXp: z.number(),
	averageCompletionTimeHours: z.number().nullable(),
	color: z.string(),
});

const CompletionTimeBucketSchema = z.object({
	bucket: z.string(),
	count: z.number(),
});

const DayOfWeekItemSchema = z.object({
	day: z.string(),
	count: z.number(),
});

const TimeOfDayItemSchema = z.object({
	hour: z.number(),
	count: z.number(),
});

const HeatmapDaySchema = z.object({
	date: z.string(),
	count: z.number(),
});

const TopTaskSchema = z.object({
	taskId: z.string(),
	title: z.string(),
	likeCount: z.number(),
	commentCount: z.number(),
	xpAward: z.number(),
});

const MemberBreakdownItemSchema = z.object({
	userId: z.string(),
	displayName: z.string(),
	image: z.string().nullable(),
	tasksCompleted: z.number(),
	totalXpEarned: z.number(),
	completionRate: z.number(),
	averageCompletionTimeHours: z.number().nullable(),
	currentStreak: z.number(),
});

// --- Response Schema ---

export const GetProjectAnalyticsResponseSchema = z.object({
	summary: SummarySchema,
	timeSeries: z.array(TimeSeriesItemSchema),
	categoryBreakdown: z.array(CategoryBreakdownItemSchema),
	completionTimeDistribution: z.array(CompletionTimeBucketSchema),
	dayOfWeekDistribution: z.array(DayOfWeekItemSchema),
	timeOfDayDistribution: z.array(TimeOfDayItemSchema),
	activityHeatmap: z.array(HeatmapDaySchema),
	topTasks: z.array(TopTaskSchema),
	memberBreakdown: z.array(MemberBreakdownItemSchema).nullable(),
	role: z.enum(["ADMIN", "USER", "VIEWER", "NONE"]),
	projectName: z.string(),
});

export type GetProjectAnalyticsResponse = z.infer<
	typeof GetProjectAnalyticsResponseSchema
>;

// Sub-type exports for component use
export type AnalyticsSummary = z.infer<typeof SummarySchema>;
export type TimeSeriesItem = z.infer<typeof TimeSeriesItemSchema>;
export type CategoryBreakdownItem = z.infer<typeof CategoryBreakdownItemSchema>;
export type CompletionTimeBucket = z.infer<typeof CompletionTimeBucketSchema>;
export type DayOfWeekItem = z.infer<typeof DayOfWeekItemSchema>;
export type TimeOfDayItem = z.infer<typeof TimeOfDayItemSchema>;
export type HeatmapDay = z.infer<typeof HeatmapDaySchema>;
export type TopTask = z.infer<typeof TopTaskSchema>;
export type MemberBreakdownItem = z.infer<typeof MemberBreakdownItemSchema>;
