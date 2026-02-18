import { sendMessage } from "@pointwise/lib/api/messages";
import type {
	Message,
	SendMessageInput,
} from "@pointwise/lib/validation/message-schema";
import { SendMessageSchema } from "@pointwise/lib/validation/message-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	Message,
	{ conversationId: string; body: SendMessageInput }
>({
	name: "sendMessage",
	request: SendMessageSchema,
	tags: {
		invalidates: (_result, _error, { conversationId }) => [
			{ type: "Messages", id: conversationId },
			"Conversations",
		],
	},
	protected: true,
	query: ({ conversationId, body }) => ({
		url: `/conversations/${conversationId}/messages`,
		method: "POST",
		body,
	}),
	handler: async ({ user, body, params }) => {
		const message = await sendMessage(params.id, user.id, body, {
			name: user.name as string | null,
			image: user.image as string | null,
		});
		return message;
	},
});
