/**
 * Project API Routes - Individual Project
 * 
 * Handles operations on a single project:
 * - GET /api/projects/:id - Get project details
 * - PATCH /api/projects/:id - Update project (admin only)
 * - DELETE /api/projects/:id - Delete project (admin only)
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { parseUpdateProjectBody } from '@pointwise/lib/validation/projects';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  verifyProjectAccess,
  verifyProjectAdmin,
  serializeProject,
} from '@pointwise/lib/api/project-access';

/**
 * GET /api/projects/:id
 * Get project details (requires access to project)
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

    // Verify access and get project
    const result = await prisma.$transaction(async (tx) => {
      return await verifyProjectAccess(tx, projectId, user.id);
    });

    if (!result.success) {
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
 * PATCH /api/projects/:id
 * Update project (admin only)
 */
export async function PATCH(
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

    // Parse and validate request body
    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseUpdateProjectBody(rawBody);
    
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', parsed.status || 400);
    }

    const updates = parsed.data;

    // Update project (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, user.id);
      
      if (!adminCheck.success) {
        return adminCheck;
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
 * DELETE /api/projects/:id
 * Delete project (admin only)
 */
export async function DELETE(
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

    // Delete project (admin only)
    const result = await prisma.$transaction(async (tx) => {
      // Verify user is admin
      const adminCheck = await verifyProjectAdmin(tx, projectId, user.id);
      
      if (!adminCheck.success) {
        return adminCheck;
      }

      // Delete all tasks in the project first (cascade should handle this, but being explicit)
      await tx.task.deleteMany({
        where: { projectId },
      });

      // Delete project
      await tx.project.delete({
        where: { id: projectId },
      });

      return {
        success: true,
        status: 200,
      };
    });

    if (!result.success) {
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

