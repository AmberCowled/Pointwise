import {
	getPendingRequests,
	sendFriendRequest,
} from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
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
			return jsonResponse(result);
		},
		SendRequestSchema,
	);
}
