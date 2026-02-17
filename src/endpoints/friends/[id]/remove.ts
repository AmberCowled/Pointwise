import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { removeFriend } from "@pointwise/lib/api/friends";
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "removeFriend",
	tags: { invalidates: ["Friends", "FriendshipStatus"] },
	protected: true,
	query: (friendId) => ({ url: `/friends/${friendId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const result = await removeFriend(user.id, params.id);
		try {
			await publishAblyEvent(
				`user:${result.friendId}:friend-requests`,
				"friendship:removed",
				{ removerId: user.id },
			);
		} catch (error) {
			console.warn("Failed to publish friendship removal event", error);
		}
		return { success: true };
	},
});
