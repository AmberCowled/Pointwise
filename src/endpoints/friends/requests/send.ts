import { sendFriendRequest } from "@pointwise/lib/api/friends";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
import { endpoint } from "ertk";
import { z } from "zod";

const SendRequestSchema = z.object({ receiverId: z.string() });

export default endpoint.post<{ status: string }, { receiverId: string }>({
	name: "sendFriendRequest",
	request: SendRequestSchema,
	tags: {
		invalidates: (_result, _error, { receiverId }) => [
			"FriendRequests",
			{ type: "FriendshipStatus", id: receiverId },
		],
	},
	protected: true,
	query: (body) => ({ url: "/friends/requests", method: "POST", body }),
	handler: async ({ user, body }) => {
		const result = await sendFriendRequest(user.id, body.receiverId);
		if (result.status === "PENDING") {
			try {
				await dispatch("FRIEND_REQUEST_RECEIVED", user.id, {}, [
					body.receiverId,
				]);
			} catch (error) {
				logDispatchError("friend request", error);
			}
		} else if (result.status === "FRIENDS") {
			try {
				await dispatch("FRIEND_REQUEST_ACCEPTED", user.id, {}, [
					body.receiverId,
				]);
			} catch (error) {
				logDispatchError("mutual friend accept", error);
			}
		}
		return result;
	},
});
