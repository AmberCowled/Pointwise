import { getConversation } from "@pointwise/lib/api/conversations";
import type { Conversation } from "@pointwise/lib/validation/conversation-schema";
import { endpoint } from "ertk";

export default endpoint.get<Conversation, string>({
	name: "getConversation",
	tags: {
		provides: (_result, _error, id) => [{ type: "Conversation", id }],
	},
	protected: true,
	maxRetries: 2,
	query: (id) => `/conversations/${id}`,
	handler: async ({ user, params }) => {
		const conversation = await getConversation(params.id, user.id);
		return conversation;
	},
});
