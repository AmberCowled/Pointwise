import { getConversations } from "@pointwise/lib/api/conversations";
import type { ConversationListItem } from "@pointwise/lib/validation/conversation-schema";
import { endpoint } from "ertk";

export default endpoint.get<ConversationListItem[], void>({
	name: "getConversations",
	tags: { provides: ["Conversations"] },
	protected: true,
	maxRetries: 2,
	query: () => "/conversations",
	handler: async ({ user }) => {
		const list = await getConversations(user.id);
		return list;
	},
});
