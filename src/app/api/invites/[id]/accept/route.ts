import { acceptInvite } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const prismaProject = await acceptInvite(id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return jsonResponse({ success: true, project });
	});
}
