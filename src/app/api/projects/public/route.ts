import {
  searchPublicProjects,
  serializeProject,
} from "@pointwise/lib/api/projects";
import {
  handleProtectedRoute,
  jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { SearchPublicProjectsRequestSchema } from "@pointwise/lib/validation/projects-schema";

export async function GET(req: Request) {
  return handleProtectedRoute(
    req,
    async ({ user, query }) => {
      const searchQuery = query?.query;
      const limit = query?.limit ?? 50;
      const offset = query?.offset ?? 0;

      const { projects: prismaProjects, total } = await searchPublicProjects(
        searchQuery,
        limit,
        offset,
      );

      const projects = prismaProjects.map((project) =>
        serializeProject(project, user.id),
      );

      return jsonResponse({
        projects,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    },
    SearchPublicProjectsRequestSchema,
  );
}
