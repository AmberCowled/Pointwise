import { publishAblyEvent } from "@pointwise/lib/ably/server";
import {
	acceptFriendRequest,
	declineFriendRequest,
} from "@pointwise/lib/api/friends";
import { endpoint } from "@pointwise/lib/ertk";
import { sendNotification } from "@pointwise/lib/notifications/service";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
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
		if (body.action === "ACCEPT") {
			const request = await acceptFriendRequest(params.id, user.id);
			try {
				await sendNotification(
					request.senderId,
					NotificationType.FRIEND_REQUEST_ACCEPTED,
					{
						accepterId: user.id,
						accepterName: request.accepter.displayName,
						accepterImage: request.accepter.image,
					},
				);
			} catch (error) {
				console.warn(
					"Failed to publish friend request acceptance event",
					error,
				);
			}
			return { success: true };
		}
		const request = await declineFriendRequest(params.id, user.id);
		try {
			await publishAblyEvent(
				`user:${request.senderId}:friend-requests`,
				"friend-request:declined",
				{ declinerId: user.id },
			);
		} catch (error) {
			console.warn("Failed to publish friend request decline event", error);
		}
		return { success: true };
	},
});
