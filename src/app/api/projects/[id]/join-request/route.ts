import { ApiError } from "@pointwise/lib/api/errors";
import { serializeProject } from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import prisma from "@pointwise/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id } = await params;

		// Get project
		const project = await prisma.project.findUniqueOrThrow({
			where: { id },
		});

		// Validate: project must be PUBLIC
		if (project.visibility !== "PUBLIC") {
			throw new ApiError("Only public projects can be joined", 400);
		}

		// Validate: user must not already be a member
		const isMember = [
			...project.adminUserIds,
			...project.projectUserIds,
			...project.viewerUserIds,
		].includes(user.id);

		if (isMember) {
			throw new ApiError("You are already a member of this project", 400);
		}

		// Validate: user must not already have a pending request
		if (project.joinRequestUserIds.includes(user.id)) {
			throw new ApiError("You already have a pending join request", 400);
		}

		// Add user to joinRequestUserIds array
		const updatedProject = await prisma.project.update({
			where: { id },
			data: {
				joinRequestUserIds: {
					push: user.id,
				},
			},
			include: { _count: { select: { tasks: true } } },
		});

		const serialized = serializeProject(updatedProject, user.id);
		return jsonResponse({ project: serialized });
	});
}
