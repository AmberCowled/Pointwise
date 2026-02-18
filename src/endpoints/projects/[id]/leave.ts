import { leaveProject, serializeProject } from "@pointwise/lib/api/projects";
import type { LeaveProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<LeaveProjectResponse, { projectId: string }>({
	name: "leaveProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: ({ projectId }) => ({
		url: `/projects/${projectId}/leave`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await leaveProject(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return { project };
	},
});
