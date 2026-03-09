import { declineFriendRequest } from "@pointwise/lib/api/friends";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
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
			await dispatch("FRIEND_REQUEST_CANCELLED", { cancellerId: user.id }, [
				request.receiverId,
			]);
		} catch (error) {
			logDispatchError("friend request cancel", error);
		}
		return { success: true };
	},
});
