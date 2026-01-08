import { inviteUsersToProject } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { InviteProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id } = await params;
			const prismaProject = await inviteUsersToProject(
				id,
				user.id,
				body.invites,
			);
			const project = serializeProject(prismaProject, user.id);
			return jsonResponse({ project });
		},
		InviteProjectRequestSchema,
	);
}
