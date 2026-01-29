import {
	getPendingRequests,
	sendFriendRequest,
} from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { z } from "zod";

const SendRequestSchema = z.object({
	receiverId: z.string(),
});

/**
 * GET /api/friends/requests
 * Get all pending friend requests for the current user.
 */
export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const requests = await getPendingRequests(user.id);
		return jsonResponse(requests);
	});
}

/**
 * POST /api/friends/requests
 * Send a friend request.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const result = await sendFriendRequest(user.id, body.receiverId);
			if (result.status === "PENDING") {
				try {
					await publishAblyEvent(
						`user:${body.receiverId}:friend-requests`,
						"friend-request:received",
						{ senderId: user.id },
					);
				} catch (error) {
					console.warn("Failed to publish friend request event", error);
				}
			}
			return jsonResponse(result);
		},
		SendRequestSchema,
	);
}
