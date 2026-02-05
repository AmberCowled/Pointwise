import { markConversationRead } from "@pointwise/lib/api/conversations";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

/**
 * PATCH /api/conversations/[id]/read
 * Mark all NEW_MESSAGE notifications for this conversation as read for the current user.
 */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: conversationId } = await params;
		const result = await markConversationRead(conversationId, user.id);
		return jsonResponse(result);
	});
}
