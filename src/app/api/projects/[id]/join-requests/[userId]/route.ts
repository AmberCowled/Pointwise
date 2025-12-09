/**
 * Join Request Approval/Rejection API
 * 
 * Handles approving or rejecting join requests
 * - POST /api/projects/:id/join-requests/:userId/approve - Approve (admin only)
 * - DELETE /api/projects/:id/join-requests/:userId - Reject/cancel request
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { parseApproveJoinRequestBody } from '@pointwise/lib/validation/user-management';
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
 * POST /api/projects/:id/join-requests/:userId/approve
 * Approve a join request and add user to project (admin only)
 */
export async function POST(
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
    const parsed = parseApproveJoinRequestBody(rawBody);

    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', parsed.status || 400);
    }

    const { role } = parsed.data!;

    // Approve join request (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify current user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, currentUser.id);

      if (!adminCheck.success) {
        return adminCheck;
      }

      const project = adminCheck.project;
      const joinRequestUserIds = (project.joinRequestUserIds as string[]) || [];

      // Check if user has pending join request
      if (!joinRequestUserIds.includes(userId)) {
        return {
          success: false,
          status: 404 as const,
          error: 'No pending join request found for this user',
        };
      }

      // Remove from join requests and add to appropriate role
      const updates: Record<string, unknown> = {
        joinRequestUserIds: joinRequestUserIds.filter((id: string) => id !== userId),
      };

      if (role === 'user') {
        updates.projectUserIds = [...((project.projectUserIds as string[]) || []), userId];
      } else if (role === 'viewer') {
        updates.viewerUserIds = [...((project.viewerUserIds as string[]) || []), userId];
      }

      // Update project
      const updated = await tx.project.update({
        where: { id: projectId },
        data: updates as any,
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
      message: 'Join request approved successfully',
    });
  });
}

/**
 * DELETE /api/projects/:id/join-requests/:userId
 * Reject a join request or cancel own request
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

    // Reject/cancel join request
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          adminUserIds: true,
          joinRequestUserIds: true,
        },
      });

      if (!project) {
        return { success: false, status: 404 as const };
      }

      const joinRequestUserIds = (project.joinRequestUserIds as string[]) || [];

      // Check if user has pending join request
      if (!joinRequestUserIds.includes(userId)) {
        return {
          success: false,
          status: 404 as const,
          error: 'No pending join request found for this user',
        };
      }

      // Can reject if:
      // 1. You are an admin of the project, OR
      // 2. You are the user who made the request (canceling own request)
      const isAdmin = (project.adminUserIds as string[]).includes(currentUser.id);
      const isOwnRequest = userId === currentUser.id;

      if (!isAdmin && !isOwnRequest) {
        return {
          success: false,
          status: 403 as const,
          error: 'Access denied',
        };
      }

      // Remove from join requests
      await tx.project.update({
        where: { id: projectId },
        data: {
          joinRequestUserIds: joinRequestUserIds.filter((id: string) => id !== userId),
        },
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
        result.status === 404 ? 'Not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      success: true,
      message: 'Join request rejected/cancelled successfully',
    });
  });
}

