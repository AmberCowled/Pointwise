import { getFriends } from "@pointwise/lib/api/friends";
import type { FriendListResponse } from "@pointwise/lib/validation/friends-schema";
import { endpoint } from "ertk";

export default endpoint.get<FriendListResponse, void>({
	name: "getFriends",
	tags: { provides: ["Friends"] },
	protected: true,
	maxRetries: 2,
	query: () => "/friends",
	handler: async ({ user }) => {
		const friends = await getFriends(user.id);
		return friends;
	},
});
