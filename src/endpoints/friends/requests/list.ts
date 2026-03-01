import { getPendingRequests } from "@pointwise/lib/api/friends";
import type { PendingRequestsResponse } from "@pointwise/lib/validation/friends-schema";
import { endpoint } from "ertk";

export default endpoint.get<PendingRequestsResponse, void>({
	name: "getPendingRequests",
	tags: { provides: ["FriendRequests"] },
	protected: true,
	maxRetries: 2,
	query: () => "/friends/requests",
	handler: async ({ user }) => {
		const requests = await getPendingRequests(user.id);
		return requests;
	},
});
