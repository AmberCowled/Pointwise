import { archiveConversation } from "@pointwise/lib/api/conversations";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

/**
 * PATCH /api/conversations/[id]/archive
 * Archive the conversation for the current user. Hides it from the messages overview until another participant sends a message.
 */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: conversationId } = await params;
		const result = await archiveConversation(conversationId, user.id);
		return jsonResponse(result);
	});
}
