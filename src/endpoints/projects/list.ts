import { getProjects, serializeProject } from "@pointwise/lib/api/projects";
import { endpoint } from "@pointwise/lib/ertk";
import type { GetProjectsResponse } from "@pointwise/lib/validation/projects-schema";

export default endpoint.get<GetProjectsResponse, void>({
	name: "getProjects",
	tags: { provides: ["Projects"] },
	protected: true,
	query: () => "/projects",
	handler: async ({ user }) => {
		const prismaProjects = await getProjects(user.id);
		const projects = prismaProjects.map((project) =>
			serializeProject(project, user.id),
		);
		return { projects };
	},
});
