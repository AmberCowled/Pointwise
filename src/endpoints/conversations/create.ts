import { createConversation } from "@pointwise/lib/api/conversations";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	Conversation,
	CreateConversationInput,
} from "@pointwise/lib/validation/conversation-schema";
import { CreateConversationSchema } from "@pointwise/lib/validation/conversation-schema";

export default endpoint.post<Conversation, CreateConversationInput>({
	name: "createConversation",
	request: CreateConversationSchema,
	tags: { invalidates: ["Conversations"] },
	protected: true,
	query: (body) => ({ url: "/conversations", method: "POST", body }),
	handler: async ({ user, body }) => {
		const conversation = await createConversation(user.id, body);
		return conversation;
	},
});
