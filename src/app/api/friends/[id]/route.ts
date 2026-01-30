import { removeFriend } from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { publishAblyEvent } from "@pointwise/lib/ably/server";

/**
 * DELETE /api/friends/[id]
 * Remove a friend.
 */
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: friendId } = await params;

	return handleProtectedRoute(req, async ({ user }) => {
		const result = await removeFriend(user.id, friendId);
		try {
			// Notify the removed friend so their UI updates in real-time
			await publishAblyEvent(
				`user:${result.friendId}:friend-requests`,
				"friendship:removed",
				{ removerId: user.id },
			);
		} catch (error) {
			console.warn("Failed to publish friendship removal event", error);
		}
		return jsonResponse({ success: true, message: "Friend removed" });
	});
}
