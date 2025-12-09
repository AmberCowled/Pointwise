/**
 * Project Access Control Helpers
 * 
 * Helper functions for checking user access to projects
 */

import type { Prisma } from '@prisma/client';
import type { ProjectRole } from '@pointwise/lib/api/types';

export interface ProjectAccessCheck {
  success: boolean;
  status: 403 | 404;
  project?: any;
  role?: ProjectRole | null;
}

/**
 * Get user's role in a project
 * Returns null if user is not in the project
 */
export function getUserRoleInProject(
  project: {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
  },
  userId: string,
): ProjectRole | null {
  if (project.adminUserIds.includes(userId)) return 'admin';
  if (project.projectUserIds.includes(userId)) return 'user';
  if (project.viewerUserIds.includes(userId)) return 'viewer';
  return null;
}

/**
 * Check if user has access to a project (any role)
 */
export function userHasAccess(
  project: {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
    visibility: string;
  },
  userId: string,
): boolean {
  // Public projects are viewable by anyone (read-only unless user is member)
  if (project.visibility === 'PUBLIC') {
    return true;
  }
  
  // Private projects require membership
  return getUserRoleInProject(project, userId) !== null;
}

/**
 * Check if user is admin of a project
 */
export function userIsAdmin(
  project: { adminUserIds: string[] },
  userId: string,
): boolean {
  return project.adminUserIds.includes(userId);
}

/**
 * Check if user can view a project
 */
export function userCanView(
  project: {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
    visibility: string;
  },
  userId: string,
): boolean {
  return userHasAccess(project, userId);
}

/**
 * Check if user can edit tasks in a project
 */
export function userCanEditTasks(
  project: {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
  },
  userId: string,
): boolean {
  const role = getUserRoleInProject(project, userId);
  return role === 'admin' || role === 'user';
}

/**
 * Check if user can manage a project (edit settings, add/remove users)
 */
export function userCanManageProject(
  project: { adminUserIds: string[] },
  userId: string,
): boolean {
  return userIsAdmin(project, userId);
}

/**
 * Verify user has access to project and return project with role
 * 
 * @param tx - Prisma transaction client
 * @param projectId - Project ID to check
 * @param userId - User ID to check access for
 * @param select - Fields to select (optional)
 * @returns Access check result with project data and role
 */
export async function verifyProjectAccess(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  select?: any,
): Promise<ProjectAccessCheck> {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: select || {
      id: true,
      name: true,
      description: true,
      visibility: true,
      adminUserIds: true,
      projectUserIds: true,
      viewerUserIds: true,
      joinRequestUserIds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) {
    return { success: false, status: 404 };
  }

  if (!userHasAccess(project as unknown as {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
    visibility: string;
  }, userId)) {
    return { success: false, status: 403 };
  }

  const role = getUserRoleInProject(project as unknown as {
    adminUserIds: string[];
    projectUserIds: string[];
    viewerUserIds: string[];
  }, userId);

  return {
    success: true,
    status: 403,
    project,
    role,
  };
}

/**
 * Verify user is admin of project
 */
export async function verifyProjectAdmin(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
): Promise<ProjectAccessCheck> {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      adminUserIds: true,
      projectUserIds: true,
      viewerUserIds: true,
    },
  });

  if (!project) {
    return { success: false, status: 404 };
  }

  if (!userIsAdmin(project, userId)) {
    return { success: false, status: 403 };
  }

  return {
    success: true,
    status: 403,
    project,
    role: 'admin',
  };
}

/**
 * Serialize project for API response
 */
export function serializeProject(project: any) {
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

