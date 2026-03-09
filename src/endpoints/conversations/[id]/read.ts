import { markConversationRead } from "@pointwise/lib/api/conversations";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
import { endpoint } from "ertk";

export default endpoint.patch<{ success: boolean }, string>({
	name: "markConversationRead",
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (id) => ({ url: `/conversations/${id}/read`, method: "PATCH" }),
	handler: async ({ user, params }) => {
		const result = await markConversationRead(params.id, user.id);

		try {
			await emitEvent("NOTIFICATIONS_READ", { userId: user.id }, [user.id]);
		} catch (error) {
			logDispatchError("notifications read sync", error);
		}

		return result;
	},
});
