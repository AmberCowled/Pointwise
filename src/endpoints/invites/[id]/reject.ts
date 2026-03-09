import { rejectInvite } from "@pointwise/lib/api/invites";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
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
			await dispatch("INVITE_REJECTED", { projectId: invite.projectId }, [
				invite.inviterId,
			]);
		} catch (error) {
			logDispatchError("invite reject event", error);
		}

		// Notify all project admins so their invite count updates in real-time
		try {
			const project = await prisma.project.findUniqueOrThrow({
				where: { id: invite.projectId },
				select: { adminUserIds: true },
			});
			const filteredAdminIds = project.adminUserIds.filter(
				(adminId) => adminId !== user.id,
			);
			await dispatch(
				"INVITE_CANCELLED",
				{ projectId: invite.projectId },
				filteredAdminIds,
			);
		} catch (error) {
			logDispatchError("invite cancel event", error);
		}

		return { success: true };
	},
});
