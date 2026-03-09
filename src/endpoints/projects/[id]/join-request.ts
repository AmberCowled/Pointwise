import { requestToJoin, serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
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

		// Send PROJECT_JOIN_REQUEST_RECEIVED notification to all admins
		try {
			await dispatch(
				"PROJECT_JOIN_REQUEST_RECEIVED",
				user.id,
				{
					projectId: params.id,
					projectName: prismaProject.name,
				},
				prismaProject.adminUserIds,
			);
		} catch (error) {
			logDispatchError("join request notification", error);
		}

		return { project };
	},
});
