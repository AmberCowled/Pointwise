import { ApiError } from "@pointwise/lib/api/errors";
import { isProjectAdmin } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import type { ProjectCreditUsageResponse } from "@pointwise/lib/validation/credits-schema";
import { getOrAddBalance } from "./balance";

export async function getProjectCreditUsage(
	projectId: string,
	userId: string,
): Promise<ProjectCreditUsageResponse> {
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		select: {
			ownerId: true,
			creditPolicy: true,
			memberCreditCap: true,
			adminUserIds: true,
			projectUserIds: true,
			viewerUserIds: true,
		},
	});

	// Verify caller is owner or admin
	const isOwner = project.ownerId === userId;
	if (!isOwner) {
		const isAdmin = await isProjectAdmin(projectId, userId);
		if (!isAdmin) {
			throw new ApiError(
				"Forbidden: Only project owner or admins can view credit usage",
				403,
			);
		}
	}

	// Get owner's balance
	const ownerBalance = await getOrAddBalance(project.ownerId);
	const ownerCredits = {
		used: ownerBalance.usedCredits,
		total: ownerBalance.totalCredits,
		remaining: Math.max(
			0,
			ownerBalance.totalCredits - ownerBalance.usedCredits,
		),
	};

	// If MEMBER_CREDITS, no per-member breakdown needed
	if (project.creditPolicy === "MEMBER_CREDITS") {
		return {
			creditPolicy: "MEMBER_CREDITS",
			memberCreditCap: project.memberCreditCap ?? null,
			ownerCredits,
			memberUsage: [],
		};
	}

	// OWNER_CREDITS — get per-member usage breakdown
	const allMemberIds = [
		...project.adminUserIds,
		...project.projectUserIds,
		...project.viewerUserIds,
	].filter((id) => id !== project.ownerId);

	if (
		allMemberIds.length === 0 ||
		!ownerBalance.periodStart ||
		!ownerBalance.periodEnd
	) {
		return {
			creditPolicy: "OWNER_CREDITS",
			memberCreditCap: project.memberCreditCap ?? null,
			ownerCredits,
			memberUsage: [],
		};
	}

	// Batch query: group usage by userId
	const usageByMember = await prisma.aiUsageEvent.groupBy({
		by: ["userId"],
		where: {
			billedUserId: project.ownerId,
			creditsCharged: { gt: 0 },
			createdAt: {
				gte: ownerBalance.periodStart,
				lte: ownerBalance.periodEnd,
			},
			userId: { in: allMemberIds },
		},
		_sum: { creditsCharged: true },
	});

	// Fetch display names for members with usage
	const memberIdsWithUsage = usageByMember.map((u) => u.userId);
	const users =
		memberIdsWithUsage.length > 0
			? await prisma.user.findMany({
					where: { id: { in: memberIdsWithUsage } },
					select: { id: true, name: true },
				})
			: [];

	const nameMap = new Map(users.map((u) => [u.id, u.name ?? "Unknown"]));

	const memberUsage = usageByMember.map((u) => ({
		userId: u.userId,
		displayName: nameMap.get(u.userId) ?? "Unknown",
		creditsUsed: u._sum.creditsCharged ?? 0,
	}));

	return {
		creditPolicy: "OWNER_CREDITS",
		memberCreditCap: project.memberCreditCap ?? null,
		ownerCredits,
		memberUsage,
	};
}
