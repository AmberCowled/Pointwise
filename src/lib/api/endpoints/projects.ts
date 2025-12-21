/**
 * API Client for Projects
 */

import { apiClient } from "../client";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from "../types";

export interface ListProjectsResponse {
  projects: Project[];
}

export interface GetProjectResponse {
  project: Project;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface DeleteProjectResponse {
  success: boolean;
}

/**
 * List all projects (public + user's projects)
 */
export async function listProjects(): Promise<ListProjectsResponse> {
  return apiClient.get<ListProjectsResponse>("/api/projects");
}

/**
 * Get a specific project
 */
export async function getProject(
  projectId: string,
): Promise<GetProjectResponse> {
  return apiClient.get<GetProjectResponse>(`/api/projects/${projectId}`);
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectRequest,
): Promise<CreateProjectResponse> {
  return apiClient.post<CreateProjectResponse>("/api/projects", data);
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest,
): Promise<UpdateProjectResponse> {
  return apiClient.patch<UpdateProjectResponse>(
    `/api/projects/${projectId}`,
    data,
  );
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string,
): Promise<DeleteProjectResponse> {
  return apiClient.delete<DeleteProjectResponse>(`/api/projects/${projectId}`);
}
