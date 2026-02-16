import { getFriendshipStatus } from "@pointwise/lib/api/friends";
import { endpoint } from "@pointwise/lib/ertk";
import type { FriendshipStatusResponse } from "@pointwise/lib/validation/friends-schema";

export default endpoint.get<FriendshipStatusResponse, string>({
	name: "getFriendshipStatus",
	tags: {
		provides: (_result, _error, userId) => [
			{ type: "FriendshipStatus", id: userId },
		],
	},
	protected: true,
	query: (userId) => `/friends/${userId}/status`,
	handler: async ({ user, params }) => {
		const status = await getFriendshipStatus(user.id, params.id);
		return status;
	},
});
