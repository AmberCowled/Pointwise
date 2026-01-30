import {
	acceptFriendRequest,
	declineFriendRequest,
} from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { sendNotification } from "@pointwise/lib/notifications/service";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";
import { z } from "zod";

const RequestActionSchema = z.object({
	action: z.enum(["ACCEPT", "DECLINE"]),
});

/**
 * PATCH /api/friends/requests/[id]
 * Accept or decline a friend request.
 */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: requestId } = await params;

	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			if (body.action === "ACCEPT") {
				const request = await acceptFriendRequest(requestId, user.id);
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
					console.warn("Failed to publish friend request acceptance event", error);
				}
				return jsonResponse({
					success: true,
					message: "Friend request accepted",
				});
			} else {
				const request = await declineFriendRequest(requestId, user.id);
				try {
					// We still publish an event so the requester's UI can refresh (e.g. "Cancel" -> "Add")
					// but the NotificationMenu will ignore this as it's not an "acceptance"
					await publishAblyEvent(
						`user:${request.senderId}:friend-requests`,
						"friend-request:declined",
						{ declinerId: user.id },
					);
				} catch (error) {
					console.warn("Failed to publish friend request decline event", error);
				}
				return jsonResponse({
					success: true,
					message: "Friend request declined",
				});
			}
		},
		RequestActionSchema,
	);
}

/**
 * DELETE /api/friends/requests/[id]
 * Cancel a sent friend request.
 */
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: requestId } = await params;

	return handleProtectedRoute(req, async ({ user }) => {
		const request = await declineFriendRequest(requestId, user.id);
		try {
			// Notify the receiver that the request has been cancelled
			await publishAblyEvent(
				`user:${request.receiverId}:friend-requests`,
				"friend-request:cancelled",
				{ cancellerId: user.id },
			);
		} catch (error) {
			console.warn("Failed to publish friend request cancellation event", error);
		}
		return jsonResponse({ success: true, message: "Friend request cancelled" });
	});
}
