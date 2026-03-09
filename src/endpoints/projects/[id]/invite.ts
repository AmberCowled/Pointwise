import { inviteUsersToProject } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
import type {
	InviteProjectRequest,
	InviteProjectResponse,
} from "@pointwise/lib/validation/projects-schema";
import { InviteProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	InviteProjectResponse,
	{ projectId: string; data: InviteProjectRequest }
>({
	name: "inviteUsersToProject",
	request: InviteProjectRequestSchema,
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: ({ projectId, data }) => ({
		url: `/projects/${projectId}/invite`,
		method: "POST",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const {
			project: prismaProject,
			invitedUsers,
			createdInvites,
		} = await inviteUsersToProject(params.id, user.id, body.invites);
		const project = serializeProject(prismaProject, user.id);

		// Build a lookup of userId → inviteId for notification payloads
		const inviteIdByUser = new Map(
			createdInvites.map((i) => [i.invitedUserId, i.id]),
		);

		// Send PROJECT_INVITE_RECEIVED notification to each invited user
		try {
			await Promise.allSettled(
				invitedUsers.map((invited) =>
					dispatch(
						"PROJECT_INVITE_RECEIVED",
						user.id,
						{
							inviteId: inviteIdByUser.get(invited.userId) ?? "",
							projectId: params.id,
							projectName: prismaProject.name,
							role: invited.role,
						},
						[invited.userId],
					),
				),
			);
		} catch (error) {
			logDispatchError("project invite notification", error);
		}

		// Publish lightweight Ably event to each admin so their invite count updates
		try {
			await dispatch(
				"INVITE_SENT",
				{ projectId: params.id },
				prismaProject.adminUserIds,
			);
		} catch (error) {
			logDispatchError("invite sent event", error);
		}

		return { project };
	},
});
