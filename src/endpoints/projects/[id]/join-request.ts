import { requestToJoin, serializeProject } from "@pointwise/lib/api/projects";
import type { RequestToJoinProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	RequestToJoinProjectResponse,
	{ projectId: string }
>({
	name: "requestToJoinProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: ({ projectId }) => ({
		url: `/projects/${projectId}/join-request`,
		method: "POST",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await requestToJoin(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return { project };
	},
});
