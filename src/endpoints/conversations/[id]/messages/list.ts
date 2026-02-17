import { getMessages } from "@pointwise/lib/api/messages";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	GetMessagesQuery,
	MessagesResponse,
} from "@pointwise/lib/validation/message-schema";
import { GetMessagesQuerySchema } from "@pointwise/lib/validation/message-schema";

export default endpoint.get<
	MessagesResponse,
	{ conversationId: string; cursor?: string; limit?: number }
>({
	name: "getMessages",
	request: GetMessagesQuerySchema,
	tags: {
		provides: (_result, _error, { conversationId }) => [
			{ type: "Messages", id: conversationId },
		],
	},
	protected: true,
	query: ({ conversationId, cursor, limit }) => {
		const params = new URLSearchParams();
		if (cursor) params.set("cursor", cursor);
		if (limit !== undefined) params.set("limit", String(limit));
		const q = params.toString();
		return `/conversations/${conversationId}/messages${q ? `?${q}` : ""}`;
	},
	handler: async ({ user, query, params }) => {
		const q = query as GetMessagesQuery | undefined;
		const result = await getMessages(params.id, user.id, {
			cursor: q?.cursor,
			limit: q?.limit,
		});
		return result;
	},
});
