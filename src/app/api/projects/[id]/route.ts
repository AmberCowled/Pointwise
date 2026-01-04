import {
	deleteProject,
	getProject,
	serializeProject,
	updateProject,
} from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { UpdateProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const prismaProject = await getProject(id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return jsonResponse({ project });
	});
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id } = await params;
			const prismaProject = await updateProject(id, body!, user.id);
			const project = serializeProject(prismaProject, user.id);
			return jsonResponse({ project });
		},
		UpdateProjectRequestSchema,
	);
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;
		const result = await deleteProject(id, user.id);
		return jsonResponse({ success: result });
	});
}
