import { leaveProject, serializeProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const prismaProject = await leaveProject(id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return jsonResponse({ project });
	});
}
