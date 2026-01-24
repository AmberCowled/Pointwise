import {
	acceptFriendRequest,
	declineFriendRequest,
} from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
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
				await acceptFriendRequest(requestId, user.id);
				return jsonResponse({
					success: true,
					message: "Friend request accepted",
				});
			} else {
				await declineFriendRequest(requestId, user.id);
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
		await declineFriendRequest(requestId, user.id);
		return jsonResponse({ success: true, message: "Friend request cancelled" });
	});
}
