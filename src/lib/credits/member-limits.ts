import { ApiError } from "@pointwise/lib/api/errors";
import { getProjectMemberCount } from "@pointwise/lib/api/projects";
import type {
	Project as PrismaProject,
	SubscriptionTier,
} from "@prisma/client";
import { resolveUserTier } from "./balance";
import { TIER_CONFIG } from "./config";

export async function getOwnerTier(ownerId: string): Promise<SubscriptionTier> {
	const userTier = await resolveUserTier(ownerId);
	return userTier.tier;
}

export function getProjectMemberLimit(tier: SubscriptionTier): number {
	return TIER_CONFIG[tier].usersPerProject;
}

export async function enforceProjectMemberLimit(
	project: PrismaProject,
	additionalCount = 1,
): Promise<void> {
	const tier = await getOwnerTier(project.ownerId);
	const limit = getProjectMemberLimit(tier);
	const current = getProjectMemberCount(project);

	if (current + additionalCount > limit) {
		throw new ApiError(
			"This project has reached its member limit.\nProject owner needs to upgrade their plan.",
			403,
		);
	}
}

export async function getProjectMemberLimitInfo(
	project: PrismaProject,
	ownerTier?: SubscriptionTier,
): Promise<{
	current: number;
	limit: number;
	exceeded: boolean;
	ownerTier: string;
}> {
	const tier = ownerTier ?? (await getOwnerTier(project.ownerId));
	const limit = getProjectMemberLimit(tier);
	const current = getProjectMemberCount(project);

	return {
		current,
		limit,
		exceeded: current > limit,
		ownerTier: tier,
	};
}
