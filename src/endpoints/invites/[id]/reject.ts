import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { rejectInvite } from "@pointwise/lib/api/invites";
import prisma from "@pointwise/lib/prisma";
import {
	RealtimeChannels,
	RealtimeEvents,
} from "@pointwise/lib/realtime/registry";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "rejectInvite",
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: (inviteId) => ({
		url: `/invites/${inviteId}/reject`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		// Fetch invite data before deletion so we can publish the Ably event
		const invite = await prisma.invite.findUniqueOrThrow({
			where: { id: params.id },
			select: { invitedUserId: true, projectId: true, inviterId: true },
		});

		await rejectInvite(params.id, user.id);

		// Notify the inviter via lightweight Ably event so their cache updates
		try {
			await publishAblyEvent(
				RealtimeChannels.user.projects(invite.inviterId),
				RealtimeEvents.INVITE_REJECTED,
				{ projectId: invite.projectId },
			);
		} catch {
			// Ably publish failure should not break the reject action
		}

		// Notify all project admins so their invite count updates in real-time
		try {
			const project = await prisma.project.findUniqueOrThrow({
				where: { id: invite.projectId },
				select: { adminUserIds: true },
			});
			await Promise.allSettled(
				project.adminUserIds
					.filter((adminId) => adminId !== user.id)
					.map((adminId) =>
						publishAblyEvent(
							RealtimeChannels.user.projects(adminId),
							RealtimeEvents.INVITE_CANCELLED,
							{ projectId: invite.projectId },
						),
					),
			);
		} catch {
			// Ably publish failure should not break the reject action
		}

		return { success: true };
	},
});
