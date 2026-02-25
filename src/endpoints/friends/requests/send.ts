import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { sendFriendRequest } from "@pointwise/lib/api/friends";
import { buildPushExtras } from "@pointwise/lib/notifications/push";
import { sendNotification } from "@pointwise/lib/notifications/service";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const SendRequestSchema = z.object({ receiverId: z.string() });

export default endpoint.post<{ status: string }, { receiverId: string }>({
	name: "sendFriendRequest",
	request: SendRequestSchema,
	tags: {
		invalidates: (_result, _error, { receiverId }) => [
			"FriendRequests",
			{ type: "FriendshipStatus", id: receiverId },
		],
	},
	protected: true,
	query: (body) => ({ url: "/friends/requests", method: "POST", body }),
	handler: async ({ user, body }) => {
		const result = await sendFriendRequest(user.id, body.receiverId);
		if (result.status === "PENDING") {
			try {
				const pushExtras = await buildPushExtras(
					body.receiverId,
					"FRIEND_REQUEST_RECEIVED",
					{
						senderId: user.id,
						senderName: user.name as string | null,
						senderImage: user.image as string | null,
					},
				);
				await publishAblyEvent(
					`user:${body.receiverId}:friend-requests`,
					"friend-request:received",
					{ senderId: user.id },
					pushExtras,
				);
			} catch (error) {
				console.warn("Failed to publish friend request event", error);
			}
		} else if (result.status === "FRIENDS") {
			try {
				await sendNotification(
					body.receiverId,
					NotificationType.FRIEND_REQUEST_ACCEPTED,
					{
						accepterId: user.id,
						accepterName: user.name as string | null,
						accepterImage: user.image as string | null,
					},
				);
			} catch (error) {
				console.warn(
					"Failed to publish friend request acceptance event (mutual)",
					error,
				);
			}
		}
		return result;
	},
});
