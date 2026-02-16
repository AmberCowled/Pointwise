import { archiveConversation } from "@pointwise/lib/api/conversations";
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.patch<{ success: true }, string>({
	name: "archiveConversation",
	tags: { invalidates: ["Conversations"] },
	protected: true,
	query: (id) => ({ url: `/conversations/${id}/archive`, method: "PATCH" }),
	handler: async ({ user, params }) => {
		const result = await archiveConversation(params.id, user.id);
		return result;
	},
});
