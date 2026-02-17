import { getConversations } from "@pointwise/lib/api/conversations";
import { endpoint } from "@pointwise/lib/ertk";
import type { ConversationListItem } from "@pointwise/lib/validation/conversation-schema";

export default endpoint.get<ConversationListItem[], void>({
	name: "getConversations",
	tags: { provides: ["Conversations"] },
	protected: true,
	query: () => "/conversations",
	handler: async ({ user }) => {
		const list = await getConversations(user.id);
		return list;
	},
});
