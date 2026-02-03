import {
	getConversation,
	leaveConversation,
	updateConversation,
} from "@pointwise/lib/api/conversations";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { UpdateConversationSchema } from "@pointwise/lib/validation/conversation-schema";

/**
 * GET /api/conversations/[id]
 * Get a single conversation with participants. Current user must be a participant.
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: conversationId } = await params;
		const conversation = await getConversation(conversationId, user.id);
		return jsonResponse(conversation);
	});
}

/**
 * PATCH /api/conversations/[id]
 * Update name and/or add members. Current user must be a participant.
 */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id: conversationId } = await params;
			const conversation = await updateConversation(
				conversationId,
				user.id,
				body,
			);
			return jsonResponse(conversation);
		},
		UpdateConversationSchema,
	);
}

/**
 * DELETE /api/conversations/[id]
 * Leave the conversation. If no participants remain, the conversation is deleted.
 */
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: conversationId } = await params;
		const result = await leaveConversation(conversationId, user.id);
		return jsonResponse(result);
	});
}
