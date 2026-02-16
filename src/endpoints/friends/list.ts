import { getFriends } from "@pointwise/lib/api/friends";
import { endpoint } from "@pointwise/lib/ertk";
import type { FriendListResponse } from "@pointwise/lib/validation/friends-schema";

export default endpoint.get<FriendListResponse, void>({
	name: "getFriends",
	tags: { provides: ["Friends"] },
	protected: true,
	query: () => "/friends",
	handler: async ({ user }) => {
		const friends = await getFriends(user.id);
		return friends;
	},
});
