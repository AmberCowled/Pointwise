import { rejectJoinRequest } from "@pointwise/lib/api/joinRequests";
import prisma from "@pointwise/lib/prisma";
import { endpoint } from "ertk";

export default endpoint.delete<
	{ success: boolean },
	{ projectId: string; userId: string }
>({
	name: "rejectJoinRequest",
	tags: { invalidates: ["JoinRequests", "Projects"] },
	protected: true,
	query: ({ projectId, userId }) => ({
		url: `/projects/${projectId}/join-requests/${userId}/reject`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		await rejectJoinRequest(params.id, user.id, params.targetId);

		// Dismiss stale PROJECT_JOIN_REQUEST_RECEIVED notifications for all admins
		try {
			const staleNotifications = await prisma.notification.findMany({
				where: {
					type: "PROJECT_JOIN_REQUEST_RECEIVED",
					read: false,
				},
				select: { id: true, data: true },
			});
			const idsToMark = staleNotifications
				.filter((n) => {
					const d = n.data as Record<string, unknown> | null;
					return (
						d?.projectId === params.id && d?.requesterId === params.targetId
					);
				})
				.map((n) => n.id);
			if (idsToMark.length > 0) {
				await prisma.notification.updateMany({
					where: { id: { in: idsToMark } },
					data: { read: true },
				});
			}
		} catch {
			// Staleness cleanup failure should not break the reject action
		}

		return { success: true };
	},
});
