import {
  handleProtectedRoute,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';
import {
  createProject,
  getProjects,
  serializeProjectWithRole,
} from '@pointwise/lib/api/projectsV2';
import { CreateProjectRequest } from '@pointwise/lib/api/types';
import { CreateProjectRequestSchema } from '@pointwise/lib/validation/projects-schema';

export async function GET(req: Request) {
  return handleProtectedRoute(req, async ({ user }) => {
    const projects = await getProjects(user.id);
    const serializedProjects = projects.map((project) =>
      serializeProjectWithRole(project, user.id),
    );
    return jsonResponse({ projects: serializedProjects });
  });
}

export async function POST(req: Request) {
  return handleProtectedRoute(req, async ({ user, body }) => {
      console.log('Backend received body:', body);
      const project = await createProject(body!, user.id);
      console.log('Created project with visibility:', project.visibility);
      const serializedProject = serializeProjectWithRole(project, user.id);
      return jsonResponse({ project: serializedProject });
    },
    CreateProjectRequestSchema,
  );
}
