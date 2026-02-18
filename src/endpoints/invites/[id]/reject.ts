import { rejectInvite } from "@pointwise/lib/api/invites";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "rejectInvite",
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: (inviteId) => ({
		url: `/invites/${inviteId}/reject`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		await rejectInvite(params.id, user.id);
		return { success: true };
	},
});
