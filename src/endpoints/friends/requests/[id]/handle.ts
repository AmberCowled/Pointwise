import {
	acceptFriendRequest,
	declineFriendRequest,
} from "@pointwise/lib/api/friends";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import { endpoint } from "ertk";
import { z } from "zod";

const RequestActionSchema = z.object({ action: z.enum(["ACCEPT", "DECLINE"]) });

export default endpoint.patch<
	{ success: boolean },
	{ requestId: string; action: "ACCEPT" | "DECLINE" }
>({
	name: "handleFriendRequest",
	request: RequestActionSchema,
	tags: { invalidates: ["Friends", "FriendRequests", "FriendshipStatus"] },
	protected: true,
	query: ({ requestId, action }) => ({
		url: `/friends/requests/${requestId}/handle`,
		method: "PATCH",
		body: { action },
	}),
	handler: async ({ user, body, params }) => {
		let senderId: string;

		if (body.action === "ACCEPT") {
			const request = await acceptFriendRequest(params.id, user.id);
			senderId = request.senderId;
			try {
				await dispatch("FRIEND_REQUEST_ACCEPTED", user.id, {}, [senderId]);
			} catch (error) {
				logDispatchError("friend request accept", error);
			}
		} else {
			const request = await declineFriendRequest(params.id, user.id);
			senderId = request.senderId;
			try {
				await dispatch("FRIEND_REQUEST_DECLINED", { declinerId: user.id }, [
					senderId,
				]);
			} catch (error) {
				logDispatchError("friend request decline", error);
			}
		}

		// Mark the matching FRIEND_REQUEST_RECEIVED notification as read
		try {
			const staleNotifs = await prisma.notification.findMany({
				where: {
					userId: user.id,
					type: "FRIEND_REQUEST_RECEIVED",
					read: false,
				},
				select: { id: true, data: true },
			});
			const matchingIds = staleNotifs
				.filter((n) => {
					const d = n.data as Record<string, unknown> | null;
					return d?.actorId === senderId;
				})
				.map((n) => n.id);
			if (matchingIds.length > 0) {
				await prisma.notification.updateMany({
					where: { id: { in: matchingIds } },
					data: { read: true },
				});
				await emitEvent("NOTIFICATIONS_READ", { userId: user.id }, [user.id]);
			}
		} catch (error) {
			logDispatchError("friend request notification cleanup", error);
		}

		return { success: true };
	},
});
