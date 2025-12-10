/**
 * Project API Routes
 * 
 * Handles project CRUD operations:
 * - GET /api/projects - List user's projects
 * - POST /api/projects - Create new project
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { parseCreateProjectBody } from '@pointwise/lib/validation/projects';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import { serializeProject } from '@pointwise/lib/api/project-access';

/**
 * GET /api/projects
 * List all projects the user has access to
 */
export async function GET(req: Request) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    
    if (!email) {
      return errorResponse('Unauthorized', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Find all projects where user is a member (admin, user, or viewer)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { adminUserIds: { has: user.id } },
          { projectUserIds: { has: user.id } },
          { viewerUserIds: { has: user.id } },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return jsonResponse({
      projects: projects.map(serializeProject),
    });
  });
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: Request) {
  return handleRoute(req, async () => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    
    if (!email) {
      return errorResponse('Unauthorized', 401);
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
    const parsed = parseCreateProjectBody(rawBody);
    
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', parsed.status || 400);
    }

    const { name, description, visibility } = parsed.data!;

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        visibility: visibility || 'PRIVATE',
        adminUserIds: [user.id], // Creator is admin
        projectUserIds: [user.id], // Creator is also in projectUserIds
        viewerUserIds: [],
        joinRequestUserIds: [],
      },
    });

    return jsonResponse(
      {
        project: serializeProject(project),
      },
      201,
    );
  });
}

