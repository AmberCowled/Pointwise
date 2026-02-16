import { canInvite } from "@pointwise/lib/api/invites";
import { endpoint } from "@pointwise/lib/ertk";
import type { InviteResponse } from "@pointwise/lib/validation/invite-schema";
import { InviteRequestSchema } from "@pointwise/lib/validation/invite-schema";

export default endpoint.get<
	InviteResponse,
	{ projectId: string; inviteeId: string; role: string }
>({
	name: "canInvite",
	request: InviteRequestSchema,
	tags: { provides: ["Invites", "Projects"] },
	protected: true,
	query: ({ projectId, inviteeId, role }) =>
		`/projects/${projectId}/can-invite?inviteeId=${inviteeId}&role=${role}`,
	handler: async ({ user, params, query }) => {
		const inviteRequest = InviteRequestSchema.parse(query);
		const canInviteResult = await canInvite(
			user.id,
			inviteRequest.inviteeId,
			params.id,
		);
		return { success: canInviteResult };
	},
});
