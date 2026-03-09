import { leaveProject, serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { LeaveProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<LeaveProjectResponse, { projectId: string }>({
	name: "leaveProject",
	tags: { invalidates: ["Projects", "Tasks"] },
	protected: true,
	query: ({ projectId }) => ({
		url: `/projects/${projectId}/leave`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await leaveProject(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);

		try {
			const notifRecipients = prismaProject.adminUserIds.filter(
				(id) => id !== user.id,
			);
			if (notifRecipients.length > 0) {
				await dispatch(
					"MEMBER_LEFT_PROJECT",
					user.id,
					{
						projectId: params.id,
						projectName: prismaProject.name,
					},
					notifRecipients,
				);
			}
		} catch (error) {
			logDispatchError("member left project notification", error);
		}

		try {
			const allRemaining = [
				...prismaProject.adminUserIds,
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			];
			if (allRemaining.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					allRemaining,
				);
			}
		} catch (error) {
			logDispatchError("member left project event", error);
		}

		return { project };
	},
});
