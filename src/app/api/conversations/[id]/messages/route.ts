import { getMessages, sendMessage } from "@pointwise/lib/api/messages";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import type { GetMessagesQuery } from "@pointwise/lib/validation/message-schema";
import {
	GetMessagesQuerySchema,
	SendMessageSchema,
} from "@pointwise/lib/validation/message-schema";

/**
 * GET /api/conversations/[id]/messages
 * Paginated messages (cursor-based). Current user must be a participant.
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: conversationId } = await params;
	return handleProtectedRoute(
		req,
		async ({ user, query }) => {
			const q = query as GetMessagesQuery | undefined;
			const result = await getMessages(conversationId, user.id, {
				cursor: q?.cursor,
				limit: q?.limit,
			});
			return jsonResponse(result);
		},
		GetMessagesQuerySchema,
	);
}

/**
 * POST /api/conversations/[id]/messages
 * Send a message. Creates Message, NEW_MESSAGE notifications for other participants, publishes to Ably.
 */
export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: conversationId } = await params;
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const message = await sendMessage(conversationId, user.id, body, {
				name: user.name,
				image: user.image,
			});
			return jsonResponse(message, 201);
		},
		SendMessageSchema,
	);
}
