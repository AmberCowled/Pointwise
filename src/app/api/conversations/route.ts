import {
	createConversation,
	getConversations,
} from "@pointwise/lib/api/conversations";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { CreateConversationSchema } from "@pointwise/lib/validation/conversation-schema";

/**
 * GET /api/conversations
 * List conversations for the current user with last message and participant summary.
 */
export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const list = await getConversations(user.id);
		return jsonResponse(list);
	});
}

/**
 * POST /api/conversations
 * Create a conversation. If 1:1 with the same two users already exists, return it.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const conversation = await createConversation(user.id, body);
			return jsonResponse(conversation, 201);
		},
		CreateConversationSchema,
	);
}
