import { getProjects, serializeProject } from "@pointwise/lib/api/projects";
import type { GetProjectsResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.get<GetProjectsResponse, void>({
	name: "getProjects",
	tags: { provides: ["Projects"] },
	protected: true,
	maxRetries: 2,
	query: () => "/projects",
	handler: async ({ user }) => {
		const prismaProjects = await getProjects(user.id);
		const projects = prismaProjects.map((project) =>
			serializeProject(project, user.id),
		);
		return { projects };
	},
});
