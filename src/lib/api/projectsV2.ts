import { ApiError } from '@pointwise/lib/api/errors';
import prisma from '@pointwise/lib/prisma';
import { Project as PrismaProject } from '@prisma/client';
import type {
  ProjectRole,
  Project,
  ProjectWithRole,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@pointwise/lib/api/types';

export async function createProject(
  request: CreateProjectRequest,
  userId: string,
): Promise<PrismaProject> {
  const project = await prisma.project.create({
    data: {
      name: request.name,
      description: request.description || null,
      visibility: request.visibility || 'PRIVATE',
      adminUserIds: [userId],
      projectUserIds: [],
      viewerUserIds: [],
      joinRequestUserIds: [],
    },
  });
  return project;
}

export async function getProject(
  projectId: string,
  userId: string,
): Promise<PrismaProject> {
  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
  });

  if (
    project.visibility === 'PUBLIC' ||
    [
      ...project.adminUserIds,
      ...project.projectUserIds,
      ...project.viewerUserIds,
    ].includes(userId)
  ) {
    return project;
  }

  throw new ApiError('Forbidden: You do not have access to this project', 403);
}

export async function getProjects(userId: string): Promise<PrismaProject[]> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { adminUserIds: { has: userId } },
        { projectUserIds: { has: userId } },
        { viewerUserIds: { has: userId } },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return projects;
}

export function getUserRoleInProject(
  project: Project | PrismaProject,
  userId: string,
): ProjectRole {
  if (project.adminUserIds.includes(userId)) {
    return 'admin';
  }
  if (project.projectUserIds.includes(userId)) {
    return 'user';
  }
  if (project.viewerUserIds.includes(userId)) {
    return 'viewer';
  }
  return 'none';
}

export function serializeProject(project: PrismaProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description || null,
    visibility: project.visibility,
    adminUserIds: project.adminUserIds || [],
    projectUserIds: project.projectUserIds || [],
    viewerUserIds: project.viewerUserIds || [],
    joinRequestUserIds: project.joinRequestUserIds || [],
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeProjectWithRole(
  project: PrismaProject,
  userId: string,
): ProjectWithRole {
  return {
    ...serializeProject(project),
    role: getUserRoleInProject(project, userId),
  };
}

async function isProjectAdmin(projectId: string, userId: string): Promise<boolean> {
  const projectAdmins = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
    select: {
      adminUserIds: true,
    },
  });
  return projectAdmins.adminUserIds.includes(userId);
}

export async function updateProject(
  projectId: string,
  request: UpdateProjectRequest,
  userId: string,
): Promise<PrismaProject> {
  const isAdmin = await isProjectAdmin(projectId, userId);
  if(!isAdmin) {
    throw new ApiError('Forbidden: You must be admin to update the project', 403);
  }

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: request.name,
      description: request.description,
      visibility: request.visibility,
    },
  });
  return project;
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const isAdmin = await isProjectAdmin(projectId, userId);
  if(!isAdmin) {
    throw new ApiError('Forbidden: You must be admin to delete the project', 403);
  }
  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
  return true;
}
