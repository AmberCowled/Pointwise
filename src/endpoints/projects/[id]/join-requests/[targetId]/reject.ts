import { rejectJoinRequest } from "@pointwise/lib/api/joinRequests";
import { endpoint } from "ertk";

export default endpoint.delete<
	{ success: boolean },
	{ projectId: string; userId: string }
>({
	name: "rejectJoinRequest",
	tags: { invalidates: ["JoinRequests", "Projects"] },
	protected: true,
	query: ({ projectId, userId }) => ({
		url: `/projects/${projectId}/join-requests/${userId}/reject`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		await rejectJoinRequest(params.id, user.id, params.targetId);
		return { success: true };
	},
});
