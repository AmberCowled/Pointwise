import { removeFriend } from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

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
		await removeFriend(user.id, friendId);
		return jsonResponse({ success: true, message: "Friend removed" });
	});
}
