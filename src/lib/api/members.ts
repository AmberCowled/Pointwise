import { ApiError } from "@pointwise/lib/api/errors";
import { getProject, getUserRoleInProject } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import type {
	ProjectMember,
	ProjectRole,
} from "@pointwise/lib/validation/projects-schema";
import type { Project as PrismaProject } from "@prisma/client";

function getRoleField(
	role: "ADMIN" | "USER" | "VIEWER",
): "adminUserIds" | "projectUserIds" | "viewerUserIds" {
	if (role === "ADMIN") return "adminUserIds";
	if (role === "USER") return "projectUserIds";
	return "viewerUserIds";
}

export async function getProjectMembers(
	projectId: string,
	requesterId: string,
): Promise<ProjectMember[]> {
	const project = await getProject(projectId, requesterId);

	const requesterRole = getUserRoleInProject(project, requesterId);
	if (requesterRole === "NONE") {
		throw new ApiError(
			"Forbidden: You must be a member to view project members",
			403,
		);
	}

	const allUserIds = [
		...project.adminUserIds,
		...project.projectUserIds,
		...project.viewerUserIds,
	];

	if (allUserIds.length === 0) {
		return [];
	}

	const users = await prisma.user.findMany({
		where: { id: { in: allUserIds } },
		select: { id: true, displayName: true, image: true },
	});

	const userMap = new Map(users.map((u) => [u.id, u]));

	const members: ProjectMember[] = [];

	// Add admins first, then users, then viewers
	for (const id of project.adminUserIds) {
		const user = userMap.get(id);
		if (user) {
			members.push({
				userId: user.id,
				displayName: user.displayName ?? "Unknown",
				image: user.image ?? null,
				role: "ADMIN",
			});
		}
	}
	for (const id of project.projectUserIds) {
		const user = userMap.get(id);
		if (user) {
			members.push({
				userId: user.id,
				displayName: user.displayName ?? "Unknown",
				image: user.image ?? null,
				role: "USER",
			});
		}
	}
	for (const id of project.viewerUserIds) {
		const user = userMap.get(id);
		if (user) {
			members.push({
				userId: user.id,
				displayName: user.displayName ?? "Unknown",
				image: user.image ?? null,
				role: "VIEWER",
			});
		}
	}

	return members;
}

export async function updateMemberRole(
	projectId: string,
	adminId: string,
	targetId: string,
	newRole: ProjectRole,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	const project = await getProject(projectId, adminId);

	if (!project.adminUserIds.includes(adminId)) {
		throw new ApiError(
			"Forbidden: You must be an admin to change member roles",
			403,
		);
	}

	if (project.adminUserIds.includes(targetId)) {
		throw new ApiError("Cannot change the role of an admin", 400);
	}

	const currentRole = getUserRoleInProject(project, targetId);
	if (currentRole === "NONE") {
		throw new ApiError("User is not a member of this project", 400);
	}

	if (currentRole === newRole) {
		throw new ApiError("User already has this role", 400);
	}

	const oldRoleField = getRoleField(currentRole as "ADMIN" | "USER" | "VIEWER");
	const newRoleField = getRoleField(newRole as "ADMIN" | "USER" | "VIEWER");

	const oldArray = project[oldRoleField] as string[];

	const updatedProject = await prisma.project.update({
		where: { id: projectId },
		data: {
			[oldRoleField]: {
				set: oldArray.filter((id) => id !== targetId),
			},
			[newRoleField]: {
				push: targetId,
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

export async function removeMember(
	projectId: string,
	adminId: string,
	targetId: string,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	const project = await getProject(projectId, adminId);

	if (!project.adminUserIds.includes(adminId)) {
		throw new ApiError(
			"Forbidden: You must be an admin to remove members",
			403,
		);
	}

	if (project.adminUserIds.includes(targetId)) {
		throw new ApiError("Cannot remove an admin from the project", 400);
	}

	const currentRole = getUserRoleInProject(project, targetId);
	if (currentRole === "NONE") {
		throw new ApiError("User is not a member of this project", 400);
	}

	const roleField = getRoleField(currentRole as "ADMIN" | "USER" | "VIEWER");
	const currentArray = project[roleField] as string[];

	const updatedProject = await prisma.project.update({
		where: { id: projectId },
		data: {
			[roleField]: {
				set: currentArray.filter((id) => id !== targetId),
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
