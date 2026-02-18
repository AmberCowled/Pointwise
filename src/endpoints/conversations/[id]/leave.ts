import { leaveConversation } from "@pointwise/lib/api/conversations";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "leaveConversation",
	tags: {
		invalidates: (_result, _error, id) => [
			"Conversations",
			{ type: "Conversation", id },
		],
	},
	protected: true,
	query: (id) => ({ url: `/conversations/${id}/leave`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const result = await leaveConversation(params.id, user.id);
		return result;
	},
});
