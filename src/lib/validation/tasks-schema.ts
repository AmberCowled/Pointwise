import { z } from "zod";

const TASK_ID_SCHEMA = z.string();
const TASK_PROJECT_ID_SCHEMA = z.string();
const TASK_TITLE_SCHEMA = z.string().min(1).max(200);
const TASK_DESCRIPTION_SCHEMA = z.string().max(20000).optional().nullable();
const TASK_XPAWARD_SCHEMA = z.number().int().min(0).max(1000000);
const TASK_CATEGORY_SCHEMA = z.string().min(1).max(60);
const TASK_OPTIONAL_SCHEMA = z.boolean();
const TASK_START_DATE_SCHEMA = z.coerce.date().optional().nullable();
const TASK_START_DATE_RESPONSE_SCHEMA = z.string().optional().nullable();
const TASK_HAS_START_TIME_SCHEMA = z.boolean().optional();
const TASK_DUE_DATE_SCHEMA = z.coerce.date().optional().nullable();
const TASK_DUE_DATE_RESPONSE_SCHEMA = z.string().optional().nullable();
const TASK_HAS_DUE_TIME_SCHEMA = z.boolean().optional();
const TASK_STATUS_SCHEMA = z.enum(["PENDING", "COMPLETED"]).optional();
export const TASK_XP_AWARD_SOURCE_SCHEMA = z
	.enum(["MANUAL", "AI_PENDING", "AI_DONE", "AI_FAILED"])
	.optional()
	.default("MANUAL");
const TASK_COMPLETED_AT_SCHEMA = z.coerce.date().optional().nullable();
const TASK_COMPLETED_AT_RESPONSE_SCHEMA = z.string().optional().nullable();
const TASK_CREATED_DATE_RESPONSE_SCHEMA = z.string();
const TASK_UPDATED_DATE_RESPONSE_SCHEMA = z.string();

export const TaskSchema = z.object({
	id: TASK_ID_SCHEMA,
	projectId: TASK_PROJECT_ID_SCHEMA,
	title: TASK_TITLE_SCHEMA,
	description: TASK_DESCRIPTION_SCHEMA,
	xpAward: TASK_XPAWARD_SCHEMA,
	xpAwardSource: TASK_XP_AWARD_SOURCE_SCHEMA,
	category: TASK_CATEGORY_SCHEMA,
	optional: TASK_OPTIONAL_SCHEMA,
	startDate: TASK_START_DATE_RESPONSE_SCHEMA,
	hasStartTime: TASK_HAS_START_TIME_SCHEMA,
	dueDate: TASK_DUE_DATE_RESPONSE_SCHEMA,
	hasDueTime: TASK_HAS_DUE_TIME_SCHEMA,
	completedAt: TASK_COMPLETED_AT_RESPONSE_SCHEMA,
	status: TASK_STATUS_SCHEMA,
	createdAt: TASK_CREATED_DATE_RESPONSE_SCHEMA,
	updatedAt: TASK_UPDATED_DATE_RESPONSE_SCHEMA,
});

export const GetTasksRequestSchema = z.object({
	projectId: TASK_ID_SCHEMA,
});

export const GetTasksResponseSchema = z.object({
	tasks: z.array(TaskSchema),
});

export const CreateTaskRequestSchema = z.object({
	projectId: TASK_PROJECT_ID_SCHEMA,
	title: TASK_TITLE_SCHEMA,
	description: TASK_DESCRIPTION_SCHEMA,
	xpAward: TASK_XPAWARD_SCHEMA,
	xpAwardSource: TASK_XP_AWARD_SOURCE_SCHEMA.optional(),
	category: TASK_CATEGORY_SCHEMA,
	optional: TASK_OPTIONAL_SCHEMA,
	startDate: TASK_START_DATE_SCHEMA,
	hasStartTime: TASK_HAS_START_TIME_SCHEMA,
	dueDate: TASK_DUE_DATE_SCHEMA,
	hasDueTime: TASK_HAS_DUE_TIME_SCHEMA,
});

export const CreateTaskResponseSchema = z.object({
	task: TaskSchema,
});

export const UpdateTaskRequestSchema = z.object({
	projectId: TASK_PROJECT_ID_SCHEMA,
	title: TASK_TITLE_SCHEMA.optional(),
	description: TASK_DESCRIPTION_SCHEMA.optional(),
	xpAward: TASK_XPAWARD_SCHEMA.optional(),
	xpAwardSource: TASK_XP_AWARD_SOURCE_SCHEMA.optional(),
	category: TASK_CATEGORY_SCHEMA.optional(),
	optional: TASK_OPTIONAL_SCHEMA.optional(),
	startDate: TASK_START_DATE_SCHEMA.optional(),
	hasStartTime: TASK_HAS_START_TIME_SCHEMA.optional(),
	dueDate: TASK_DUE_DATE_SCHEMA.optional(),
	hasDueTime: TASK_HAS_DUE_TIME_SCHEMA.optional(),
	status: TASK_STATUS_SCHEMA.optional(),
	completedAt: TASK_COMPLETED_AT_SCHEMA.optional(),
});

export const UpdateTaskResponseSchema = z.object({
	task: TaskSchema,
});

export const DeleteTaskRequestSchema = z.object({
	taskId: TASK_ID_SCHEMA,
});

export const DeleteTaskResponseSchema = z.object({
	success: z.boolean(),
});

export type Task = z.infer<typeof TaskSchema>;
export type GetTasksRequest = z.infer<typeof GetTasksRequestSchema>;
export type GetTasksResponse = z.infer<typeof GetTasksResponseSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type CreateTaskResponse = z.infer<typeof CreateTaskResponseSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;
export type UpdateTaskResponse = z.infer<typeof UpdateTaskResponseSchema>;
export type DeleteTaskRequest = z.infer<typeof DeleteTaskRequestSchema>;
export type DeleteTaskResponse = z.infer<typeof DeleteTaskResponseSchema>;
export type XpAwardSource = z.infer<typeof TASK_XP_AWARD_SOURCE_SCHEMA>;
