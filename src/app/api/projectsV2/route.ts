import { handleProtectedRoute, jsonResponse } from '@pointwise/lib/api/route-handler';
import { getProjects, serializeProjectWithRole } from '@pointwise/lib/api/projectsV2';

export async function GET(req: Request) {
  return handleProtectedRoute(req, async ({ user }) => {
    const projects = await getProjects(user.id);
    const serializedProjects = projects.map(project => serializeProjectWithRole(project, user.id));
    return jsonResponse({ projects: serializedProjects });
  });
}