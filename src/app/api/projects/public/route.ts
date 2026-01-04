import {
	searchPublicProjects,
	serializeProject,
} from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { SearchPublicProjectsRequestSchema } from "@pointwise/lib/validation/projects-schema";
import type { z } from "zod";

type SearchPublicProjectsQuery = z.infer<typeof SearchPublicProjectsRequestSchema>;

export async function GET(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, query }) => {
			// query is guaranteed to be present when schema is provided (SearchPublicProjectsRequestSchema)
			// Type assertion needed due to TypeScript overload resolution limitations
			const queryData = query as unknown as SearchPublicProjectsQuery;
			const searchQuery = queryData.query;
			const limit = queryData.limit ?? 50;
			const offset = queryData.offset ?? 0;

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
