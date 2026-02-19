import { acceptInvite } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import { sendNotification } from "@pointwise/lib/notifications/service";
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
			await sendNotification(invite.inviterId, "PROJECT_INVITE_ACCEPTED", {
				projectId: prismaProject.id,
				projectName: invite.projectName,
				accepterName: (user.name as string) ?? null,
				accepterImage: (user.image as string) ?? null,
				role: invite.inviteRole,
			});
		} catch {
			// Notification failure should not break the accept action
		}

		return { success: true, project };
	},
});
