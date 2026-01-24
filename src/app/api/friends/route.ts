import { getFriends } from "@pointwise/lib/api/friends";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

/**
 * GET /api/friends
 * Get all friends of the current user.
 */
export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const friends = await getFriends(user.id);
		return jsonResponse(friends);
	});
}
