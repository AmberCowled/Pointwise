import {
	searchPublicProjects,
	serializeProject,
} from "@pointwise/lib/api/projects";
import type {
	SearchPublicProjectsRequest,
	SearchPublicProjectsResponse,
} from "@pointwise/lib/validation/projects-schema";
import { SearchPublicProjectsRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	SearchPublicProjectsResponse,
	SearchPublicProjectsRequest
>({
	name: "searchPublicProjects",
	request: SearchPublicProjectsRequestSchema,
	tags: { provides: ["Projects"] },
	protected: true,
	query: () => "/projects/public",
	handler: async ({ user, query }) => {
		const q = query as SearchPublicProjectsRequest;
		const searchQuery = q?.query;
		const limit = q?.limit ?? 50;
		const offset = q?.offset ?? 0;
		const { projects: prismaProjects, total } = await searchPublicProjects(
			searchQuery,
			limit,
			offset,
		);
		const projects = prismaProjects.map((project) =>
			serializeProject(project, user.id),
		);
		return {
			projects,
			pagination: { total, limit, offset, hasMore: offset + limit < total },
		};
	},
});
