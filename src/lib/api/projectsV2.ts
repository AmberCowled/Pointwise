import { ApiError } from "@pointwise/lib/api/errors";
import prisma from "@pointwise/lib/prisma";
import {
  type CreateProjectRequest,
  type Project,
  type ProjectRole,
  ProjectSchema,
  type UpdateProjectRequest,
} from "@pointwise/lib/validation/projects-schema";
import type { Project as PrismaProject } from "@prisma/client";

export async function createProject(
  request: CreateProjectRequest,
  userId: string,
): Promise<PrismaProject & { _count: { tasksV2: number } }> {
  const project = await prisma.project.create({
    data: {
      name: request.name,
      description: request.description || null,
      visibility: request.visibility || "PRIVATE",
      adminUserIds: [userId],
    },
    include: {
      _count: {
        select: {
          tasksV2: true,
        },
      },
    },
  });
  return project as PrismaProject & { _count: { tasksV2: number } };
}

export async function getProject(
  projectId: string,
  userId: string,
): Promise<PrismaProject & { _count: { tasksV2: number } }> {
  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
    include: {
      _count: {
        select: {
          tasksV2: true,
        },
      },
    },
  });

  if (
    project.visibility === "PUBLIC" ||
    [
      ...project.adminUserIds,
      ...project.projectUserIds,
      ...project.viewerUserIds,
    ].includes(userId)
  ) {
    return project as PrismaProject & { _count: { tasksV2: number } };
  }

  throw new ApiError("Forbidden: You do not have access to this project", 403);
}

export async function getProjects(
  userId: string,
): Promise<(PrismaProject & { _count: { tasksV2: number } })[]> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { adminUserIds: { has: userId } },
        { projectUserIds: { has: userId } },
        { viewerUserIds: { has: userId } },
      ],
    },
    include: {
      _count: {
        select: {
          tasksV2: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return projects as (PrismaProject & { _count: { tasksV2: number } })[];
}

export function getUserRoleInProject(
  project: Project | PrismaProject,
  userId: string,
): ProjectRole {
  if (project.adminUserIds.includes(userId)) {
    return "ADMIN";
  }
  if (project.projectUserIds.includes(userId)) {
    return "USER";
  }
  if (project.viewerUserIds.includes(userId)) {
    return "VIEWER";
  }
  return "NONE";
}

export function getProjectMemberCount(
  project: Project | PrismaProject,
): number {
  return (
    (project.adminUserIds?.length ?? 0) +
    (project.projectUserIds?.length ?? 0) +
    (project.viewerUserIds?.length ?? 0)
  );
}

export function serializeProject(
  project: PrismaProject & { _count?: { tasksV2: number } },
  userId: string,
): Project {
  return ProjectSchema.parse({
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
    taskCount: project._count?.tasksV2 ?? 0,
    role: getUserRoleInProject(project, userId),
  });
}

export async function verifyProjectAccess(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
  });
  return (
    project.visibility === "PUBLIC" ||
    [
      ...project.adminUserIds,
      ...project.projectUserIds,
      project.viewerUserIds,
    ].includes(userId)
  );
}

export async function isProjectUserOrHigher(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
  });
  return [...project.adminUserIds, ...project.projectUserIds].includes(userId);
}

export async function isProjectAdmin(
  projectId: string,
  userId: string,
): Promise<boolean> {
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
): Promise<PrismaProject & { _count: { tasksV2: number } }> {
  const isAdmin = await isProjectAdmin(projectId, userId);
  if (!isAdmin) {
    throw new ApiError(
      "Forbidden: You must be admin to update the project",
      403,
    );
  }

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: request.name,
      description: request.description ?? null,
      visibility: request.visibility,
    },
    include: {
      _count: {
        select: {
          tasksV2: true,
        },
      },
    },
  });
  return project as PrismaProject & { _count: { tasksV2: number } };
}

export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const isAdmin = await isProjectAdmin(projectId, userId);
  if (!isAdmin) {
    throw new ApiError(
      "Forbidden: You must be admin to delete the project",
      403,
    );
  }
  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
  return true;
}
