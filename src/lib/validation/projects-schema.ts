import { z } from "zod";

const PROJECT_ID_SCHEMA = z.string();
const PROJECT_NAME_SCHEMA = z.string().min(1).max(100);
const PROJECT_DESCRIPTION_SCHEMA = z
	.string()
	.min(1)
	.max(1000)
	.nullable()
	.optional();
const PROJECT_VISIBILITY_SCHEMA = z
	.enum(["PUBLIC", "PRIVATE"])
	.optional()
	.default("PRIVATE");
const PROJECT_ADMIN_USER_IDS_SCHEMA = z
	.array(z.string())
	.optional()
	.default([]);
const PROJECT_PROJECT_USER_IDS_SCHEMA = z
	.array(z.string())
	.optional()
	.default([]);
const PROJECT_VIEWER_USER_IDS_SCHEMA = z
	.array(z.string())
	.optional()
	.default([]);
const PROJECT_JOIN_REQUEST_USER_IDS_SCHEMA = z
	.array(z.string())
	.optional()
	.default([]);
const PROJECT_CREATED_DATE_RESPONSE_SCHEMA = z.string();
const PROJECT_UPDATED_DATE_RESPONSE_SCHEMA = z.string();
const PROJECT_TASK_COUNT_SCHEMA = z.number().optional().default(0);
const PROJECT_ROLE_SCHEMA = z
	.enum(["ADMIN", "USER", "VIEWER", "NONE"])
	.optional()
	.default("NONE");

export const ProjectSchema = z.object({
	id: PROJECT_ID_SCHEMA,
	name: PROJECT_NAME_SCHEMA,
	description: PROJECT_DESCRIPTION_SCHEMA,
	visibility: PROJECT_VISIBILITY_SCHEMA,
	adminUserIds: PROJECT_ADMIN_USER_IDS_SCHEMA,
	projectUserIds: PROJECT_PROJECT_USER_IDS_SCHEMA,
	viewerUserIds: PROJECT_VIEWER_USER_IDS_SCHEMA,
	joinRequestUserIds: PROJECT_JOIN_REQUEST_USER_IDS_SCHEMA,
	createdAt: PROJECT_CREATED_DATE_RESPONSE_SCHEMA,
	updatedAt: PROJECT_UPDATED_DATE_RESPONSE_SCHEMA,
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

export const SearchPublicProjectsRequestSchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(50),
	offset: z.coerce.number().int().min(0).optional().default(0),
});

export const SearchPublicProjectsResponseSchema = z.object({
	projects: ProjectsSchema,
	pagination: z.object({
		total: z.number(),
		limit: z.number(),
		offset: z.number(),
		hasMore: z.boolean(),
	}),
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

export const RequestToJoinProjectRequestSchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
});

export const RequestToJoinProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export const CancelRequestToJoinProjectRequestSchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
});

export const CancelRequestToJoinProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export const LeaveProjectRequestSchema = z.object({
	projectId: PROJECT_ID_SCHEMA,
});

export const LeaveProjectResponseSchema = z.object({
	project: ProjectSchema,
});

export type Project = z.infer<typeof ProjectSchema>;
export type Projects = z.infer<typeof ProjectsSchema>;
export type ProjectRole = z.infer<typeof PROJECT_ROLE_SCHEMA>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type CreateProjectResponse = z.infer<typeof CreateProjectResponseSchema>;
export type GetProjectResponse = z.infer<typeof GetProjectResponseSchema>;
export type GetProjectsResponse = z.infer<typeof GetProjectsResponseSchema>;
export type SearchPublicProjectsRequest = z.infer<
	typeof SearchPublicProjectsRequestSchema
>;
export type SearchPublicProjectsResponse = z.infer<
	typeof SearchPublicProjectsResponseSchema
>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type UpdateProjectResponse = z.infer<typeof UpdateProjectResponseSchema>;
export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;
export type RequestToJoinProjectRequest = z.infer<
	typeof RequestToJoinProjectRequestSchema
>;
export type RequestToJoinProjectResponse = z.infer<
	typeof RequestToJoinProjectResponseSchema
>;
export type CancelRequestToJoinProjectRequest = z.infer<
	typeof CancelRequestToJoinProjectRequestSchema
>;
export type CancelRequestToJoinProjectResponse = z.infer<
	typeof CancelRequestToJoinProjectResponseSchema
>;
export type LeaveProjectRequest = z.infer<typeof LeaveProjectRequestSchema>;
export type LeaveProjectResponse = z.infer<typeof LeaveProjectResponseSchema>;
