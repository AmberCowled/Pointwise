import { updateConversation } from "@pointwise/lib/api/conversations";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	Conversation,
	UpdateConversationInput,
} from "@pointwise/lib/validation/conversation-schema";
import { UpdateConversationSchema } from "@pointwise/lib/validation/conversation-schema";

export default endpoint.patch<
	Conversation,
	{ id: string; body: UpdateConversationInput }
>({
	name: "updateConversation",
	request: UpdateConversationSchema,
	tags: {
		invalidates: (_result, _error, { id }) => [
			"Conversations",
			{ type: "Conversation", id },
		],
	},
	protected: true,
	query: ({ id, body }) => ({
		url: `/conversations/${id}`,
		method: "PATCH",
		body,
	}),
	handler: async ({ user, body, params }) => {
		const conversation = await updateConversation(params.id, user.id, body);
		return conversation;
	},
});
