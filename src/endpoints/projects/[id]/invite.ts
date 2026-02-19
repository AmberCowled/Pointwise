import { inviteUsersToProject } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import { sendNotification } from "@pointwise/lib/notifications/service";
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
					sendNotification(invited.userId, "PROJECT_INVITE_RECEIVED", {
						inviteId: inviteIdByUser.get(invited.userId) ?? "",
						projectId: params.id,
						projectName: prismaProject.name,
						inviterName: (user.name as string) ?? null,
						inviterImage: (user.image as string) ?? null,
						role: invited.role,
					}),
				),
			);
		} catch {
			// Notification failure should not break the invite action
		}

		return { project };
	},
});
