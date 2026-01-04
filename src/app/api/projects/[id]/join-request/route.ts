import {
	cancelRequestToJoin,
	requestToJoin,
	serializeProject,
} from "@pointwise/lib/api/projects";
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
		const prismaProject = await requestToJoin(id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return jsonResponse({ project });
	});
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const prismaProject = await cancelRequestToJoin(id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return jsonResponse({ project });
	});
}
