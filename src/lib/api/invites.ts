import { ApiError } from "@pointwise/lib/api/errors";
import { getProject } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import type { ProjectRole } from "@pointwise/lib/validation/projects-schema";
import type { Invite, Project as PrismaProject } from "@prisma/client";

export async function getProjectInvites(projectId: string): Promise<
	Array<
		Invite & {
			inviter: { id: string; name: string | null };
			invitedUser: { id: string; name: string | null };
		}
	>
> {
	const invites = await prisma.invite.findMany({
		where: { projectId },
		include: {
			inviter: {
				select: {
					id: true,
					name: true,
				},
			},
			invitedUser: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	return invites;
}

export async function inviteUsersToProject(
	projectId: string,
	inviterId: string,
	invites: Array<{ userId: string; role: ProjectRole }>,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	// 1. Get project
	const project = await getProject(projectId, inviterId);

	// 2. Verify inviter is admin
	if (!project.adminUserIds.includes(inviterId)) {
		throw new ApiError("Forbidden: You must be admin to invite users", 403);
	}

	// 3. Get existing invites for this project
	const existingInvites = await getProjectInvites(projectId);
	const existingInviteUserIds = new Set(
		existingInvites.map((i) => i.invitedUserId),
	);
	existingInviteUserIds.forEach((userId) => {
		existingInvites.find((invite) => invite.invitedUserId === userId)
			?.inviteRole;
	});

	// 4. Build sets of existing members
	const existingMembers = new Set([
		...project.adminUserIds,
		...project.projectUserIds,
		...project.viewerUserIds,
	]);

	// 5. Filter and validate invites
	const validInvites: Array<{ userId: string; role: ProjectRole }> = [];
	const invalidUserIds: string[] = [];

	for (const invite of invites) {
		// Skip if already a member (including self-invite)
		if (existingMembers.has(invite.userId)) continue;

		// Skip if already invited
		if (existingInviteUserIds.has(invite.userId)) continue;

		// Validate user exists
		const userExists = await prisma.user.findUnique({
			where: { id: invite.userId },
			select: { id: true },
		});

		if (!userExists) {
			invalidUserIds.push(invite.userId);
			continue;
		}

		validInvites.push(invite);
	}

	// 6. Return error if no valid invites (all filtered out or invalid)
	if (validInvites.length === 0) {
		if (invalidUserIds.length > 0) {
			throw new ApiError(`Invalid user IDs: ${invalidUserIds.join(", ")}`, 400);
		}
		throw new ApiError(
			"No valid invites to create. Users may already be members or have pending invites.",
			400,
		);
	}

	// 7. Create invites in database
	await prisma.invite.createMany({
		data: validInvites.map((invite) => ({
			inviterId,
			invitedUserId: invite.userId,
			projectId,
			inviteRole: invite.role as "ADMIN" | "USER" | "VIEWER",
		})),
	});

	// 8. Return updated project with new invite count
	const updatedProject = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
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

export async function getReceivedInvites(userId: string): Promise<
	Array<
		Invite & {
			inviter: { id: string; name: string | null };
			project: {
				id: string;
				name: string;
				description: string | null;
				visibility: "PUBLIC" | "PRIVATE";
			};
		}
	>
> {
	const invites = await prisma.invite.findMany({
		where: { invitedUserId: userId },
		include: {
			inviter: {
				select: {
					id: true,
					name: true,
				},
			},
			project: {
				select: {
					id: true,
					name: true,
					description: true,
					visibility: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	return invites;
}

export async function acceptInvite(
	inviteId: string,
	userId: string,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	// 1. Get the invite and verify it belongs to the user
	const invite = await prisma.invite.findUniqueOrThrow({
		where: { id: inviteId },
		include: {
			project: true,
		},
	});

	if (invite.invitedUserId !== userId) {
		throw new ApiError("Forbidden: This invite does not belong to you", 403);
	}

	// 2. Check if user is already a member
	const project = invite.project;
	const existingMembers = new Set([
		...project.adminUserIds,
		...project.projectUserIds,
		...project.viewerUserIds,
	]);

	if (existingMembers.has(userId)) {
		// User is already a member, just delete the invite
		await prisma.invite.delete({
			where: { id: inviteId },
		});
		throw new ApiError("You are already a member of this project", 400);
	}

	// 3. Add user to the appropriate role array based on inviteRole
	const roleField =
		invite.inviteRole === "ADMIN"
			? "adminUserIds"
			: invite.inviteRole === "USER"
				? "projectUserIds"
				: "viewerUserIds";

	// 4. Update project and delete invite in a transaction
	const updatedProject = await prisma.$transaction(async (tx) => {
		// Add user to project
		const updated = await tx.project.update({
			where: { id: invite.projectId },
			data: {
				[roleField]: {
					push: userId,
				},
			},
			include: {
				_count: {
					select: { tasks: true, projectInvites: true },
				},
			},
		});

		// Delete the invite
		await tx.invite.delete({
			where: { id: inviteId },
		});

		return updated;
	});

	return updatedProject as PrismaProject & {
		_count: { tasks: number; projectInvites?: number };
	};
}

export async function rejectInvite(
	inviteId: string,
	userId: string,
): Promise<void> {
	// 1. Get the invite and verify it belongs to the user
	const invite = await prisma.invite.findUniqueOrThrow({
		where: { id: inviteId },
	});

	if (invite.invitedUserId !== userId) {
		throw new ApiError("Forbidden: This invite does not belong to you", 403);
	}

	// 2. Delete the invite
	await prisma.invite.delete({
		where: { id: inviteId },
	});
}

export async function canInvite(
	inviterId: string,
	inviteeId: string,
	projectId: string,
): Promise<boolean> {
	const project = await getProject(projectId, inviterId);
	if (!project) {
		throw new ApiError("Project not found", 404);
	}
	if (!project.adminUserIds.includes(inviterId)) {
		throw new ApiError("Forbidden: You must be admin to invite users", 403);
	}
	if (
		[
			...project.adminUserIds,
			...project.projectUserIds,
			...project.viewerUserIds,
		].includes(inviteeId)
	) {
		throw new ApiError(
			"Forbidden: The user you are inviting is already a member of this project",
			403,
		);
	}
	if (project.joinRequestUserIds?.includes(inviteeId)) {
		throw new ApiError(
			"Forbidden: The user you are inviting has a pending join request for this project",
			403,
		);
	}
	const invites = await getProjectInvites(projectId);
	if (invites.some((invite) => invite.invitedUserId === inviteeId)) {
		throw new ApiError(
			"Forbidden: The user you are inviting has a pending invite for this project",
			403,
		);
	}
	return true;
}
