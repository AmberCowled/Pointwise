import { getReceivedInvites } from "@pointwise/lib/api/invites";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const invites = await getReceivedInvites(user.id);
		return jsonResponse({ invites });
	});
}
