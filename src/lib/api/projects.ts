import { ApiError } from "@pointwise/lib/api/errors";
import prisma from "@pointwise/lib/prisma";
import {
	type CreateProjectRequest,
	type Project,
	type ProjectRole,
	ProjectSchema,
	type UpdateProjectRequest,
} from "@pointwise/lib/validation/projects-schema";
import type { Prisma, Project as PrismaProject } from "@prisma/client";

export async function createProject(
	request: CreateProjectRequest,
	userId: string,
): Promise<PrismaProject & { _count: { tasks: number } }> {
	const project = await prisma.project.create({
		data: {
			name: request.name,
			description: request.description || null,
			goal: request.goal ?? null,
			visibility: request.visibility || "PRIVATE",
			adminUserIds: [userId],
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});
	return project as PrismaProject & { _count: { tasks: number } };
}

export async function getProject(
	projectId: string,
	userId: string,
): Promise<
	PrismaProject & { _count: { tasks: number; projectInvites?: number } }
> {
	const project = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
		include: {
			_count: {
				select: {
					tasks: true,
					projectInvites: true,
				},
			},
		},
	});

	if (
		project.visibility === "PUBLIC" ||
		[
			...project.adminUserIds,
			...project.projectUserIds,
			...project.viewerUserIds,
		].includes(userId)
	) {
		return project as PrismaProject & {
			_count: { tasks: number; projectInvites?: number };
		};
	}

	throw new ApiError("Forbidden: You do not have access to this project", 403);
}

export async function getProjects(
	userId: string,
): Promise<
	(PrismaProject & { _count: { tasks: number; projectInvites?: number } })[]
> {
	const projects = await prisma.project.findMany({
		where: {
			OR: [
				{ adminUserIds: { has: userId } },
				{ projectUserIds: { has: userId } },
				{ viewerUserIds: { has: userId } },
			],
		},
		include: {
			_count: {
				select: {
					tasks: true,
					projectInvites: true,
				},
			},
		},
		orderBy: {
			updatedAt: "desc",
		},
	});

	return projects as (PrismaProject & { _count: { tasks: number } })[];
}

export async function searchPublicProjects(
	query?: string,
	limit: number = 50,
	offset: number = 0,
): Promise<{
	projects: (PrismaProject & { _count: { tasks: number } })[];
	total: number;
}> {
	const searchTerm = query?.trim();

	// Use MongoDB text search if query provided, otherwise use regular Prisma query
	if (searchTerm) {
		// Use MongoDB $text search via findRaw for case-insensitive text search
		// Fetch enough results to handle offset + limit (with reasonable max of 1000)
		const fetchLimit = Math.min(offset + limit, 1000);
		const rawResults = await prisma.project.findRaw({
			filter: {
				$and: [{ visibility: "PUBLIC" }, { $text: { $search: searchTerm } }],
			},
			options: {
				limit: fetchLimit,
				sort: { score: { $meta: "textScore" } }, // Sort by text search relevance
			},
		});

		// Get all matching IDs from text search, sorted by relevance
		const allMatchingIds = (
			rawResults as unknown as { _id: { $oid: string } }[]
		).map((doc) => doc._id.$oid);

		// Apply offset and limit to get the page we need
		const matchingIds = allMatchingIds.slice(offset, offset + limit);

		// Fetch full typed data for the matching IDs using Prisma's type-safe API
		const projects = await prisma.project.findMany({
			where: {
				id: { in: matchingIds },
				visibility: "PUBLIC",
			},
			include: {
				_count: {
					select: {
						tasks: true,
						projectInvites: true,
					},
				},
			},
		});

		// Sort projects to match the text search relevance order
		const idOrder = new Map(matchingIds.map((id, index) => [id, index]));
		projects.sort((a, b) => {
			const aIndex = idOrder.get(a.id) ?? Infinity;
			const bIndex = idOrder.get(b.id) ?? Infinity;
			return aIndex - bIndex;
		});

		// Get total count for text search results using aggregation
		const countResult = await prisma.project.aggregateRaw({
			pipeline: [
				{
					$match: {
						$and: [
							{ visibility: "PUBLIC" },
							{ $text: { $search: searchTerm } },
						],
					},
				},
				{ $count: "total" },
			],
		});
		const total =
			(countResult as unknown as [{ total: number }] | [])[0]?.total ?? 0;

		return {
			projects: projects as (PrismaProject & { _count: { tasks: number } })[],
			total,
		};
	}

	// No search query - use regular Prisma query
	const where: Prisma.ProjectWhereInput = {
		visibility: "PUBLIC",
	};

	const [projects, total] = await Promise.all([
		prisma.project.findMany({
			where,
			include: {
				_count: {
					select: {
						tasks: true,
					},
				},
			},
			orderBy: { updatedAt: "desc" },
			take: limit,
			skip: offset,
		}),
		prisma.project.count({ where }),
	]);

	return {
		projects: projects as (PrismaProject & { _count: { tasks: number } })[],
		total,
	};
}

export function getUserRoleInProject(
	project: Project | PrismaProject,
	userId: string,
): ProjectRole {
	if (project.adminUserIds.includes(userId)) {
		return "ADMIN";
	}
	if (project.projectUserIds.includes(userId)) {
		return "USER";
	}
	if (project.viewerUserIds.includes(userId)) {
		return "VIEWER";
	}
	return "NONE";
}

export function getProjectMemberCount(
	project: Project | PrismaProject,
): number {
	return (
		(project.adminUserIds?.length ?? 0) +
		(project.projectUserIds?.length ?? 0) +
		(project.viewerUserIds?.length ?? 0)
	);
}

export function serializeProject(
	project: PrismaProject & {
		_count?: { tasks: number; projectInvites?: number };
	},
	userId: string,
): Project {
	return ProjectSchema.parse({
		id: project.id,
		name: project.name,
		description: project.description || null,
		goal: project.goal || null,
		visibility: project.visibility,
		adminUserIds: project.adminUserIds || [],
		projectUserIds: project.projectUserIds || [],
		viewerUserIds: project.viewerUserIds || [],
		joinRequestUserIds: project.joinRequestUserIds || [],
		createdAt: project.createdAt.toISOString(),
		updatedAt: project.updatedAt.toISOString(),
		taskCount: project._count?.tasks ?? 0,
		inviteCount: project._count?.projectInvites ?? 0,
		role: getUserRoleInProject(project, userId),
	});
}

export async function verifyProjectAccess(
	projectId: string,
	userId: string,
): Promise<boolean> {
	const project = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
	});
	return (
		project.visibility === "PUBLIC" ||
		[
			...project.adminUserIds,
			...project.projectUserIds,
			project.viewerUserIds,
		].includes(userId)
	);
}

export async function isProjectUserOrHigher(
	projectId: string,
	userId: string,
): Promise<boolean> {
	const project = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
	});
	return [...project.adminUserIds, ...project.projectUserIds].includes(userId);
}

export async function isProjectAdmin(
	projectId: string,
	userId: string,
): Promise<boolean> {
	const projectAdmins = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
		select: {
			adminUserIds: true,
		},
	});
	return projectAdmins.adminUserIds.includes(userId);
}

export const hasWriteAccess = (role: ProjectRole): boolean => {
	return role === "ADMIN" || role === "USER";
};

export const hasDeleteAccess = (role: ProjectRole): boolean => {
	return role === "ADMIN";
};

export async function updateProject(
	projectId: string,
	request: UpdateProjectRequest,
	userId: string,
): Promise<PrismaProject & { _count: { tasks: number } }> {
	const isAdmin = await isProjectAdmin(projectId, userId);
	if (!isAdmin) {
		throw new ApiError(
			"Forbidden: You must be admin to update the project",
			403,
		);
	}

	const project = await prisma.project.update({
		where: {
			id: projectId,
		},
		data: {
			name: request.name,
			description: request.description ?? null,
			goal: request.goal ?? null,
			visibility: request.visibility,
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});
	return project as PrismaProject & { _count: { tasks: number } };
}

export async function deleteProject(
	projectId: string,
	userId: string,
): Promise<boolean> {
	const isAdmin = await isProjectAdmin(projectId, userId);
	if (!isAdmin) {
		throw new ApiError(
			"Forbidden: You must be admin to delete the project",
			403,
		);
	}
	await prisma.project.delete({
		where: {
			id: projectId,
		},
	});
	return true;
}

export async function requestToJoin(
	projectId: string,
	userId: string,
): Promise<PrismaProject & { _count: { tasks: number } }> {
	const prismaProject = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});

	if (getUserRoleInProject(prismaProject, userId) !== "NONE") {
		throw new ApiError("You are already a member of this project", 400);
	}

	if (prismaProject.joinRequestUserIds.includes(userId)) {
		throw new ApiError("You already have a pending join request", 400);
	}

	const updatedProject = (await prisma.project.update({
		where: {
			id: projectId,
		},
		data: {
			joinRequestUserIds: {
				push: userId,
			},
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	})) as PrismaProject & { _count: { tasks: number } };

	return updatedProject;
}

export async function cancelRequestToJoin(
	projectId: string,
	userId: string,
): Promise<PrismaProject & { _count: { tasks: number } }> {
	const prismaProject = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});

	if (!prismaProject.joinRequestUserIds.includes(userId)) {
		throw new ApiError("You do not have a pending join request", 400);
	}

	const updatedProject = (await prisma.project.update({
		where: {
			id: projectId,
		},
		data: {
			joinRequestUserIds: {
				set: prismaProject.joinRequestUserIds.filter((id) => id !== userId),
			},
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	})) as PrismaProject & { _count: { tasks: number } };
	return updatedProject;
}

export async function leaveProject(
	projectId: string,
	userId: string,
): Promise<PrismaProject & { _count: { tasks: number } }> {
	const prismaProject = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});

	const role = getUserRoleInProject(prismaProject, userId);
	if (role === "NONE") {
		throw new ApiError("You are not a member of this project", 403);
	}

	if (role === "ADMIN" && prismaProject.adminUserIds.length === 1) {
		throw new ApiError(
			"You are the only admin of this project and cannot leave",
			400,
		);
	}

	const updatedProject = await prisma.project.update({
		where: {
			id: projectId,
		},
		data: {
			projectUserIds: {
				set: prismaProject.projectUserIds.filter((id) => id !== userId),
			},
		},
		include: {
			_count: {
				select: {
					tasks: true,
				},
			},
		},
	});
	return updatedProject as PrismaProject & { _count: { tasks: number } };
}
