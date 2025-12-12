import {
  handleProtectedRoute,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  getProject,
  updateProject,
  deleteProject,
  serializeProjectWithRole,
} from '@pointwise/lib/api/projectsV2';
import { UpdateProjectRequestSchema } from '@pointwise/lib/validation/projects-schema';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleProtectedRoute(req, async ({ user }) => {
    const { id } = await params;
    const project = await getProject(id, user.id);
    const serializedProject = serializeProjectWithRole(project, user.id);
    return jsonResponse({ project: serializedProject });
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleProtectedRoute(
    req,
    async ({ user, body }) => {
      const { id } = await params;
      const project = await updateProject(id, body!, user.id);
      const serializedProject = serializeProjectWithRole(project, user.id);
      return jsonResponse({ project: serializedProject });
    },
    UpdateProjectRequestSchema,
  );
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleProtectedRoute(req, async ({ user }) => {
    const { id } = await params;
    const result = await deleteProject(id, user.id);
    return jsonResponse({ success: result });
  });
}