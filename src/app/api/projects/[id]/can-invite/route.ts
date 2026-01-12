import { canInvite } from "@pointwise/lib/api/invites";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { InviteRequestSchema } from "@pointwise/lib/validation/invite-schema";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, query }) => {
			const { id } = await params;
			const inviteRequest = InviteRequestSchema.parse(query);
			const canInviteResult = await canInvite(
				user.id,
				inviteRequest.inviteeId,
				id,
			);
			return jsonResponse({ success: canInviteResult });
		},
		InviteRequestSchema,
	);
}
