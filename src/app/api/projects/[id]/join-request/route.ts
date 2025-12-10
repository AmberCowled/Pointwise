/**
 * Project Join Request API
 * 
 * Handles join requests for public projects
 * - POST /api/projects/:id/join-request - Request to join (user)
 * - GET /api/projects/:id/join-requests - List join requests (admin only)
 * - POST /api/projects/:id/join-requests/:userId/approve - Approve request (admin only)
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
 * POST /api/projects/:id/join-request
 * Request to join a public project
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId } = await params;

    if (!projectId) {
      return errorResponse('Project ID required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Request to join project
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          visibility: true,
          adminUserIds: true,
          projectUserIds: true,
          viewerUserIds: true,
          joinRequestUserIds: true,
        },
      });

      if (!project) {
        return { success: false, status: 404 as const };
      }

      // Can only join public projects
      if (project.visibility !== 'PUBLIC') {
        return {
          success: false,
          status: 403 as const,
          error: 'Can only request to join public projects',
        };
      }

      // Check if already a member
      const isAlreadyMember =
        project.adminUserIds.includes(user.id) ||
        project.projectUserIds.includes(user.id) ||
        project.viewerUserIds.includes(user.id);

      if (isAlreadyMember) {
        return {
          success: false,
          status: 400 as const,
          error: 'You are already a member of this project',
        };
      }

      // Check if already requested
      const joinRequestUserIds = project.joinRequestUserIds || [];
      if (joinRequestUserIds.includes(user.id)) {
        return {
          success: false,
          status: 400 as const,
          error: 'Join request already pending',
        };
      }

      // Add join request
      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          joinRequestUserIds: [...joinRequestUserIds, user.id],
        },
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
      success: true,
      message: 'Join request submitted successfully',
    });
  });
}

/**
 * GET /api/projects/:id/join-requests
 * List pending join requests (admin only)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: projectId } = await params;

    if (!projectId) {
      return errorResponse('Project ID required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get join requests (admin only)
    const result = await prisma.$transaction(async (tx) => {
      const adminCheck = await verifyProjectAdmin(tx, projectId, user.id);

      if (!adminCheck.success) {
        return adminCheck;
      }

      const project = adminCheck.project;
      const joinRequestUserIds = project.joinRequestUserIds || [];

      // Get user details for all join requests
      const users = await tx.user.findMany({
        where: {
          id: { in: joinRequestUserIds },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return {
        success: true,
        status: 200,
        users,
      };
    });

    if (!result.success) {
      return errorResponse(
        result.status === 404 ? 'Project not found' : 'Access denied',
        result.status,
      );
    }

    return jsonResponse({
      joinRequests: (result as { users: { name: string | null; id: string; email: string | null; image: string | null; }[] }).users,
    });
  });
}

