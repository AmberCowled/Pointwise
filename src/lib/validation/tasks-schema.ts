import { z } from "zod";

const TASK_ID_SCHEMA = z.string();
const TASK_PROJECT_ID_SCHEMA = z.string();
const TASK_TITLE_SCHEMA = z.string().min(1).max(200);
const TASK_DESCRIPTION_SCHEMA = z.string().optional().nullable();
const TASK_XPAWARD_SCHEMA = z.number().int().min(0).max(1000000);
const TASK_CATEGORY_SCHEMA = z.string().min(1).max(60);
const TASK_OPTIONAL_SCHEMA = z.boolean().default(false);
const TASK_STARTDATE_SCHEMA = z.string().optional().nullable();
const TASK_STARTTIME_SCHEMA = z.string().regex(/^\d{2}:\d{2}$/).optional().nullable();
const TASK_DUEDATE_SCHEMA = z.string().optional().nullable();
const TASK_DUETIME_SCHEMA = z.string().regex(/^\d{2}:\d{2}$/).optional().nullable();
const TASK_STATUS_SCHEMA = z.enum(['PENDING', 'COMPLETED']).optional();

export const GetTasksRequestSchema = z.object({
    projectId: TASK_ID_SCHEMA,
});

export const CreateTaskRequestSchema = z.object({
    projectId: TASK_PROJECT_ID_SCHEMA,
    title: TASK_TITLE_SCHEMA,
    description: TASK_DESCRIPTION_SCHEMA,
    xpAward: TASK_XPAWARD_SCHEMA,
    category: TASK_CATEGORY_SCHEMA,
    optional: TASK_OPTIONAL_SCHEMA,
    startDate: TASK_STARTDATE_SCHEMA,
    startTime: TASK_STARTTIME_SCHEMA,
    dueDate: TASK_DUEDATE_SCHEMA,
    dueTime: TASK_DUETIME_SCHEMA
});

export const UpdateTaskRequestSchema = z.object({
    title: TASK_TITLE_SCHEMA.optional(),
    description: TASK_DESCRIPTION_SCHEMA.optional(),
    xpAward: TASK_XPAWARD_SCHEMA.optional(),
    category: TASK_CATEGORY_SCHEMA.optional(),
    optional: TASK_OPTIONAL_SCHEMA.optional(),
    startDate: TASK_STARTDATE_SCHEMA.optional(),
    startTime: TASK_STARTTIME_SCHEMA.optional(),
    dueDate: TASK_DUEDATE_SCHEMA.optional(),
    dueTime: TASK_DUETIME_SCHEMA.optional(),
    status: TASK_STATUS_SCHEMA
});

export type GetTasksRequest = z.infer<typeof GetTasksRequestSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;