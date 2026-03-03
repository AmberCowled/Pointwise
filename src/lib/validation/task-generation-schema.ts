import { z } from "zod";

// ── Suggestions ──

const ExistingTaskSchema = z.object({
	title: z.string(),
	category: z.string(),
	status: z.string(),
});

export const TaskSuggestionsRequestSchema = z.object({
	projectId: z.string(),
	goal: z.string().optional().nullable(),
	existingTasks: z.array(ExistingTaskSchema).default([]),
	userPrompt: z.string().max(500).optional().nullable(),
});

const TaskSuggestionSchema = z.object({
	title: z.string(),
	summary: z.string(),
});

export const TaskSuggestionsResponseSchema = z.object({
	suggestions: z.array(TaskSuggestionSchema),
});

// ── Expand ──

export const TaskExpandRequestSchema = z.object({
	projectId: z.string(),
	goal: z.string().optional().nullable(),
	title: z.string().min(1),
	summary: z.string().min(1),
});

export const TaskExpandResponseSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: z.string(),
});

// ── Types ──

export type ExistingTask = z.infer<typeof ExistingTaskSchema>;
export type TaskSuggestionsRequest = z.infer<
	typeof TaskSuggestionsRequestSchema
>;
export type TaskSuggestionsResponse = z.infer<
	typeof TaskSuggestionsResponseSchema
>;
export type TaskSuggestion = z.infer<typeof TaskSuggestionSchema>;
export type TaskExpandRequest = z.infer<typeof TaskExpandRequestSchema>;
export type TaskExpandResponse = z.infer<typeof TaskExpandResponseSchema>;
