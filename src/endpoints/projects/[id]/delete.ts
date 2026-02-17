import { deleteProject } from "@pointwise/lib/api/projects";
import { endpoint } from "@pointwise/lib/ertk";
import type { DeleteProjectResponse } from "@pointwise/lib/validation/projects-schema";

export default endpoint.delete<DeleteProjectResponse, string>({
	name: "deleteProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: (projectId) => ({ url: `/projects/${projectId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const result = await deleteProject(params.id, user.id);
		return { success: result };
	},
});
