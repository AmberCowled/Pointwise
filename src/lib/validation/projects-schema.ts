import { z } from "zod";

const PROJECT_ID_SCHEMA = z.string();
const PROJECT_NAME_SCHEMA = z.string().min(1).max(100);
const PROJECT_DESCRIPTION_SCHEMA = z.string().min(1).max(1000).nullable().optional();
const PROJECT_VISIBILITY_SCHEMA = z.enum(["PUBLIC", "PRIVATE"]).optional().default("PRIVATE");
const PROJECT_ADMIN_USER_IDS_SCHEMA = z.array(z.string()).optional().default([]);
const PROJECT_PROJECT_USER_IDS_SCHEMA = z.array(z.string()).optional().default([]);
const PROJECT_VIEWER_USER_IDS_SCHEMA = z.array(z.string()).optional().default([]);
const PROJECT_JOIN_REQUEST_USER_IDS_SCHEMA = z.array(z.string()).optional().default([]);
const PROJECT_CREATED_AT_SCHEMA = z.string().optional().nullable();
const PROJECT_CREATEDATE_RESPONSE_SCHEMA = z.string();
const PROJECT_UPDATED_AT_SCHEMA = z.string().optional().nullable();
const PROJECT_UPDATEDATE_RESPONSE_SCHEMA = z.string();
const PROJECT_TASK_COUNT_SCHEMA = z.number().optional().default(0);
const PROJECT_ROLE_SCHEMA = z.enum(["ADMIN", "USER", "VIEWER", "NONE"]).optional().default("NONE");

export const ProjectSchema = z.object({
	id: PROJECT_ID_SCHEMA,
	name: PROJECT_NAME_SCHEMA,
	description: PROJECT_DESCRIPTION_SCHEMA,
	visibility: PROJECT_VISIBILITY_SCHEMA,
	adminUserIds: PROJECT_ADMIN_USER_IDS_SCHEMA,
	projectUserIds: PROJECT_PROJECT_USER_IDS_SCHEMA,
	viewerUserIds: PROJECT_VIEWER_USER_IDS_SCHEMA,
	joinRequestUserIds: PROJECT_JOIN_REQUEST_USER_IDS_SCHEMA,
	createdAt: PROJECT_CREATEDATE_RESPONSE_SCHEMA,
	updatedAt: PROJECT_UPDATEDATE_RESPONSE_SCHEMA,
	taskCount: PROJECT_TASK_COUNT_SCHEMA,
	role: PROJECT_ROLE_SCHEMA,
});

export const ProjectsSchema = z.array(ProjectSchema);

export const CreateProjectRequestSchema = z.object({
	name: PROJECT_NAME_SCHEMA,
	description: PROJECT_DESCRIPTION_SCHEMA,
	visibility: PROJECT_VISIBILITY_SCHEMA,
});

export const CreateProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export const GetProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export const GetProjectsResponseSchema = z.object({
	projects: ProjectsSchema,
});

export const UpdateProjectRequestSchema = z.object({
	name: PROJECT_NAME_SCHEMA,
	description: PROJECT_DESCRIPTION_SCHEMA,
	visibility: PROJECT_VISIBILITY_SCHEMA,
});

export const UpdateProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export const DeleteProjectResponseSchema = z.object({
	success: z.boolean(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;
export type ProjectRole = z.infer<typeof PROJECT_ROLE_SCHEMA>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type CreateProjectResponse = z.infer<typeof CreateProjectResponseSchema>;
export type GetProjectResponse = z.infer<typeof GetProjectResponseSchema>;
export type GetProjectsResponse = z.infer<typeof GetProjectsResponseSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type UpdateProjectResponse = z.infer<typeof UpdateProjectResponseSchema>;
export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;
