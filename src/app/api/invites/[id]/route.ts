import { rejectInvite } from "@pointwise/lib/api/invites";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		await rejectInvite(id, user.id);
		return jsonResponse({ success: true });
	});
}
