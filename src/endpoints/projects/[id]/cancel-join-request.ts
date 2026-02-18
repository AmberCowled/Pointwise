import {
	cancelRequestToJoin,
	serializeProject,
} from "@pointwise/lib/api/projects";
import type { CancelRequestToJoinProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	CancelRequestToJoinProjectResponse,
	{ projectId: string }
>({
	name: "cancelRequestToJoinProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: ({ projectId }) => ({
		url: `/projects/${projectId}/cancel-join-request`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await cancelRequestToJoin(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return { project };
	},
});
