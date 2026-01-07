import { ApiError } from "@pointwise/lib/api/errors";
import { getProjectInvites } from "@pointwise/lib/api/invites";
import { getProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;

		// Verify user is admin
		const project = await getProject(id, user.id);
		if (!project.adminUserIds.includes(user.id)) {
			throw new ApiError(
				"Forbidden: You must be an admin to view invites",
				403,
			);
		}

		const invites = await getProjectInvites(id);
		return jsonResponse({ invites });
	});
}
