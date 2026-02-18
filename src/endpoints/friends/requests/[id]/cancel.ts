import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { declineFriendRequest } from "@pointwise/lib/api/friends";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "cancelFriendRequest",
	tags: { invalidates: ["FriendRequests", "FriendshipStatus"] },
	protected: true,
	query: (requestId) => ({
		url: `/friends/requests/${requestId}`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		const request = await declineFriendRequest(params.id, user.id);
		try {
			await publishAblyEvent(
				`user:${request.receiverId}:friend-requests`,
				"friend-request:cancelled",
				{ cancellerId: user.id },
			);
		} catch (error) {
			console.warn(
				"Failed to publish friend request cancellation event",
				error,
			);
		}
		return { success: true };
	},
});
