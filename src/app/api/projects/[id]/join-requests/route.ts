import { getProjectJoinRequests } from "@pointwise/lib/api/joinRequests";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const requests = await getProjectJoinRequests(id, user.id);
		return jsonResponse({ requests });
	});
}
