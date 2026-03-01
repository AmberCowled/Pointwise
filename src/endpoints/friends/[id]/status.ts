import { getFriendshipStatus } from "@pointwise/lib/api/friends";
import type { FriendshipStatusResponse } from "@pointwise/lib/validation/friends-schema";
import { endpoint } from "ertk";

export default endpoint.get<FriendshipStatusResponse, string>({
	name: "getFriendshipStatus",
	tags: {
		provides: (_result, _error, userId) => [
			{ type: "FriendshipStatus", id: userId },
		],
	},
	protected: true,
	maxRetries: 2,
	query: (userId) => `/friends/${userId}/status`,
	handler: async ({ user, params }) => {
		const status = await getFriendshipStatus(user.id, params.id);
		return status;
	},
});
