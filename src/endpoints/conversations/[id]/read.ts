import { markConversationRead } from "@pointwise/lib/api/conversations";
import { endpoint } from "ertk";

export default endpoint.patch<{ success: boolean }, string>({
	name: "markConversationRead",
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (id) => ({ url: `/conversations/${id}/read`, method: "PATCH" }),
	handler: async ({ user, params }) => {
		const result = await markConversationRead(params.id, user.id);
		return result;
	},
});
