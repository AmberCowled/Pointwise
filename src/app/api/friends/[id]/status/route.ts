import { getFriendshipStatus } from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

/**
 * GET /api/friends/[id]/status
 * Get the friendship status with a specific user.
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: targetUserId } = await params;

	return handleProtectedRoute(req, async ({ user }) => {
		const status = await getFriendshipStatus(user.id, targetUserId);
		return jsonResponse(status);
	});
}
