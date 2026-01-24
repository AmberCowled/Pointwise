import {
	approveJoinRequest,
	rejectJoinRequest,
} from "@pointwise/lib/api/joinRequests";
import { serializeProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { z } from "zod";

const ApproveJoinRequestSchema = z.object({
	role: z.enum(["ADMIN", "USER", "VIEWER"]),
});

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string; targetId: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id, targetId: requestingUserId } = await params;
			const parsed = ApproveJoinRequestSchema.parse(body);
			const prismaProject = await approveJoinRequest(
				id,
				user.id,
				requestingUserId,
				parsed.role,
			);
			const project = serializeProject(prismaProject, user.id);
			return jsonResponse({ success: true, project });
		},
		ApproveJoinRequestSchema,
	);
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string; targetId: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id, targetId: requestingUserId } = await params;
		await rejectJoinRequest(id, user.id, requestingUserId);
		return jsonResponse({ success: true });
	});
}
