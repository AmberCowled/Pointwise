/**
 * Project User Management API
 * 
 * Handles adding, updating, and removing users from projects
 * - POST /api/projects/:id/users - Add user to project (admin only)
 * - PATCH /api/projects/:id/users/:userId - Update user role (admin only)
 * - DELETE /api/projects/:id/users/:userId - Remove user from project (admin only)
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import {
  parseAddUserBody,
  parseUpdateUserRoleBody,
} from '@pointwise/lib/validation/user-management';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  verifyProjectAdmin,
  serializeProject,
} from '@pointwise/lib/api/project-access';

/**
 * POST /api/projects/:id/users
 * Add user to project with specified role (admin only)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId } = await params;

    if (!projectId) {
      return errorResponse('Project ID required', 400);
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    // Parse and validate request body
    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseAddUserBody(rawBody);

    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', parsed.status || 400);
    }

    const { userId, role } = parsed.data!;

    // Check if user to add exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return errorResponse('User to add not found', 404);
    }

    // Add user to project (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify current user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, currentUser.id);

      if (!adminCheck.success) {
        return adminCheck;
      }

      const project = adminCheck.project;

      // Check if user is already in project
      const isAlreadyMember =
        project.adminUserIds.includes(userId) ||
        project.projectUserIds.includes(userId) ||
        project.viewerUserIds.includes(userId);

      if (isAlreadyMember) {
        return {
          success: false,
          status: 400 as const,
          error: 'User is already a member of this project',
        };
      }

      // Add user to appropriate role array
      const updates: any = {};

      if (role === 'admin') {
        updates.adminUserIds = [...project.adminUserIds, userId];
        updates.projectUserIds = [...project.projectUserIds, userId]; // Admins are also in projectUserIds
      } else if (role === 'user') {
        updates.projectUserIds = [...project.projectUserIds, userId];
      } else if (role === 'viewer') {
        updates.viewerUserIds = [...project.viewerUserIds, userId];
      }

      // Remove from join requests if present
      const joinRequestUserIds = project.joinRequestUserIds || [];
      if (joinRequestUserIds.includes(userId)) {
        updates.joinRequestUserIds = joinRequestUserIds.filter((id: string) => id !== userId);
      }

      // Update project
      const updated = await tx.project.update({
        where: { id: projectId },
        data: updates,
      });

      return {
        success: true,
        status: 200,
        project: updated,
      };
    });

    if (!result.success) {
      if ('error' in result && result.error) {
        return errorResponse(result.error, result.status);
      }
      return errorResponse(
        result.status === 404 ? 'Project not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      project: serializeProject(result.project),
    });
  });
}

/**
 * PATCH /api/projects/:id/users/:userId
 * Update user's role in project (admin only)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  return handleRoute(async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId, userId } = await params;

    if (!projectId || !userId) {
      return errorResponse('Project ID and User ID required', 400);
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    // Parse and validate request body
    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseUpdateUserRoleBody(rawBody);

    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', parsed.status || 400);
    }

    const { role: newRole } = parsed.data!;

    // Update user role (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify current user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, currentUser.id);

      if (!adminCheck.success) {
        return adminCheck;
      }

      const project = adminCheck.project;

      // Check if user is in project
      const isInProject =
        project.adminUserIds.includes(userId) ||
        project.projectUserIds.includes(userId) ||
        project.viewerUserIds.includes(userId);

      if (!isInProject) {
        return {
          success: false,
          status: 404 as const,
          error: 'User is not a member of this project',
        };
      }

      // Cannot change own role if you're the only admin
      if (userId === currentUser.id && project.adminUserIds.length === 1 && newRole !== 'admin') {
        return {
          success: false,
          status: 400 as const,
          error: 'Cannot remove admin role from the only admin',
        };
      }

      // Remove user from all role arrays
      const adminUserIds = (project.adminUserIds as string[]).filter((id: string) => id !== userId);
      const projectUserIds = (project.projectUserIds as string[]).filter((id: string) => id !== userId);
      const viewerUserIds = (project.viewerUserIds as string[]).filter((id: string) => id !== userId);

      // Add user to new role array
      const updates: any = {
        adminUserIds,
        projectUserIds,
        viewerUserIds,
      };

      if (newRole === 'admin') {
        updates.adminUserIds = [...adminUserIds, userId];
        updates.projectUserIds = [...projectUserIds, userId]; // Admins are also in projectUserIds
      } else if (newRole === 'user') {
        updates.projectUserIds = [...projectUserIds, userId];
      } else if (newRole === 'viewer') {
        updates.viewerUserIds = [...viewerUserIds, userId];
      }

      // Update project
      const updated = await tx.project.update({
        where: { id: projectId },
        data: updates,
      });

      return {
        success: true,
        status: 200,
        project: updated,
      };
    });

    if (!result.success) {
      if ('error' in result && result.error) {
        return errorResponse(result.error, result.status);
      }
      return errorResponse(
        result.status === 404 ? 'Project not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      project: serializeProject(result.project),
    });
  });
}

/**
 * DELETE /api/projects/:id/users/:userId
 * Remove user from project (admin only)
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  return handleRoute(async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId, userId } = await params;

    if (!projectId || !userId) {
      return errorResponse('Project ID and User ID required', 400);
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    // Remove user from project (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify current user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, currentUser.id);

      if (!adminCheck.success) {
        return adminCheck;
      }

      const project = adminCheck.project;

      // Check if user is in project
      const isInProject =
        project.adminUserIds.includes(userId) ||
        project.projectUserIds.includes(userId) ||
        project.viewerUserIds.includes(userId);

      if (!isInProject) {
        return {
          success: false,
          status: 404 as const,
          error: 'User is not a member of this project',
        };
      }

      // Cannot remove yourself if you're the only admin
      if (userId === currentUser.id && project.adminUserIds.length === 1) {
        return {
          success: false,
          status: 400 as const,
          error: 'Cannot remove the only admin from the project',
        };
      }

      // Remove user from all role arrays
      const updates: any = {
        adminUserIds: project.adminUserIds.filter((id: string) => id !== userId),
        projectUserIds: project.projectUserIds.filter((id: string) => id !== userId),
        viewerUserIds: project.viewerUserIds.filter((id: string) => id !== userId),
      };

      // Update project
      await tx.project.update({
        where: { id: projectId },
        data: updates,
      });

      return {
        success: true,
        status: 200,
      };
    });

    if (!result.success) {
      if ('error' in result && result.error) {
        return errorResponse(result.error, result.status);
      }
      return errorResponse(
        result.status === 404 ? 'Project not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      success: true,
    });
  });
}

