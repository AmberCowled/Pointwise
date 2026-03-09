import { acceptInvite } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<{ success: boolean; project: Project }, string>({
	name: "acceptInvite",
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: (inviteId) => ({ url: `/invites/${inviteId}/accept`, method: "POST" }),
	handler: async ({ user, params }) => {
		const { project: prismaProject, invite } = await acceptInvite(
			params.id,
			user.id,
		);
		const project = serializeProject(prismaProject, user.id);

		// Send PROJECT_INVITE_ACCEPTED notification to the inviter
		try {
			await dispatch(
				"PROJECT_INVITE_ACCEPTED",
				user.id,
				{
					projectId: prismaProject.id,
					projectName: invite.projectName,
					role: invite.inviteRole,
				},
				[invite.inviterId],
			);
		} catch (error) {
			logDispatchError("invite accept notification", error);
		}

		// Realtime cache invalidation for all project members (including inviter)
		try {
			const allMembers = [
				...prismaProject.adminUserIds,
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			];
			const eventRecipients = allMembers.filter((id) => id !== user.id);
			if (eventRecipients.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: prismaProject.id },
					eventRecipients,
				);
			}
		} catch (error) {
			logDispatchError("invite accept event", error);
		}

		return { success: true, project };
	},
});
