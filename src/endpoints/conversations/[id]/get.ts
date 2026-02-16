import { getConversation } from "@pointwise/lib/api/conversations";
import { endpoint } from "@pointwise/lib/ertk";
import type { Conversation } from "@pointwise/lib/validation/conversation-schema";

export default endpoint.get<Conversation, string>({
	name: "getConversation",
	tags: {
		provides: (_result, _error, id) => [{ type: "Conversation", id }],
	},
	protected: true,
	query: (id) => `/conversations/${id}`,
	handler: async ({ user, params }) => {
		const conversation = await getConversation(params.id, user.id);
		return conversation;
	},
});
