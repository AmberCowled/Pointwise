import { getPendingRequests } from "@pointwise/lib/api/friends";
import { endpoint } from "@pointwise/lib/ertk";
import type { PendingRequestsResponse } from "@pointwise/lib/validation/friends-schema";

export default endpoint.get<PendingRequestsResponse, void>({
	name: "getPendingRequests",
	tags: { provides: ["FriendRequests"] },
	protected: true,
	query: () => "/friends/requests",
	handler: async ({ user }) => {
		const requests = await getPendingRequests(user.id);
		return requests;
	},
});
