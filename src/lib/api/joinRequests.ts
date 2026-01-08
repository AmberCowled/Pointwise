import { ApiError } from "@pointwise/lib/api/errors";
import { getProject } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import type { ProjectRole } from "@pointwise/lib/validation/projects-schema";
import type { Project as PrismaProject } from "@prisma/client";

export async function getProjectJoinRequests(
	projectId: string,
	userId: string,
): Promise<
	Array<{
		userId: string;
		name: string | null;
		requestedAt: string;
	}>
> {
	// 1. Verify user is admin
	const project = await getProject(projectId, userId);
	if (!project.adminUserIds.includes(userId)) {
		throw new ApiError(
			"Forbidden: You must be an admin to view join requests",
			403,
		);
	}

	// 2. Get user details for each join request
	const joinRequestUserIds = project.joinRequestUserIds || [];

	if (joinRequestUserIds.length === 0) {
		return [];
	}

	const users = await prisma.user.findMany({
		where: {
			id: { in: joinRequestUserIds },
		},
		select: {
			id: true,
			name: true,
		},
	});

	// 3. Map to response format (use project updatedAt as approximation for requestedAt)
	// In the future, we could add a JoinRequest model with timestamps
	const requestedAt = project.updatedAt.toISOString();

	return users.map((user) => ({
		userId: user.id,
		name: user.name,
		requestedAt,
	}));
}

export async function approveJoinRequest(
	projectId: string,
	userId: string,
	requestingUserId: string,
	role: ProjectRole,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	// 1. Get project and verify user is admin
	const project = await getProject(projectId, userId);
	if (!project.adminUserIds.includes(userId)) {
		throw new ApiError(
			"Forbidden: You must be an admin to approve join requests",
			403,
		);
	}

	// 2. Verify requesting user has a pending join request
	if (!project.joinRequestUserIds.includes(requestingUserId)) {
		throw new ApiError("User does not have a pending join request", 400);
	}

	// 3. Verify user is not already a member
	const existingMembers = new Set([
		...project.adminUserIds,
		...project.projectUserIds,
		...project.viewerUserIds,
	]);
	if (existingMembers.has(requestingUserId)) {
		throw new ApiError("User is already a member of this project", 400);
	}

	// 4. Determine which role array to add to
	const roleField =
		role === "ADMIN"
			? "adminUserIds"
			: role === "USER"
				? "projectUserIds"
				: "viewerUserIds";

	// 5. Update project: remove from joinRequestUserIds and add to appropriate role array
	const updatedProject = await prisma.project.update({
		where: { id: projectId },
		data: {
			joinRequestUserIds: {
				set: project.joinRequestUserIds.filter((id) => id !== requestingUserId),
			},
			[roleField]: {
				push: requestingUserId,
			},
		},
		include: {
			_count: {
				select: { tasks: true, projectInvites: true },
			},
		},
	});

	return updatedProject as PrismaProject & {
		_count: { tasks: number; projectInvites?: number };
	};
}

export async function rejectJoinRequest(
	projectId: string,
	userId: string,
	requestingUserId: string,
): Promise<void> {
	// 1. Get project and verify user is admin
	const project = await getProject(projectId, userId);
	if (!project.adminUserIds.includes(userId)) {
		throw new ApiError(
			"Forbidden: You must be an admin to reject join requests",
			403,
		);
	}

	// 2. Verify requesting user has a pending join request
	if (!project.joinRequestUserIds.includes(requestingUserId)) {
		throw new ApiError("User does not have a pending join request", 400);
	}

	// 3. Remove user from joinRequestUserIds
	await prisma.project.update({
		where: { id: projectId },
		data: {
			joinRequestUserIds: {
				set: project.joinRequestUserIds.filter((id) => id !== requestingUserId),
			},
		},
	});
}
