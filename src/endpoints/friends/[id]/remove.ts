import { removeFriend } from "@pointwise/lib/api/friends";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "removeFriend",
	tags: { invalidates: ["Friends", "FriendshipStatus"] },
	protected: true,
	query: (friendId) => ({ url: `/friends/${friendId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const result = await removeFriend(user.id, params.id);
		try {
			await dispatch("FRIENDSHIP_REMOVED", { removerId: user.id }, [
				result.friendId,
			]);
		} catch (error) {
			logDispatchError("friendship removal", error);
		}
		return { success: true };
	},
});
