import { getProjects, serializeProject } from "@pointwise/lib/api/projects";
import {
	getOwnerTier,
	getProjectMemberLimitInfo,
} from "@pointwise/lib/credits/member-limits";
import { getOwnerStorageInfo } from "@pointwise/lib/credits/storage";
import type { GetProjectsResponse } from "@pointwise/lib/validation/projects-schema";
import type { SubscriptionTier } from "@prisma/client";
import { endpoint } from "ertk";

export default endpoint.get<GetProjectsResponse, void>({
	name: "getProjects",
	tags: { provides: ["Projects"] },
	protected: true,
	maxRetries: 2,
	query: () => "/projects",
	handler: async ({ user }) => {
		const prismaProjects = await getProjects(user.id);

		// Batch-fetch owner tiers: collect unique ownerIds, single query
		const uniqueOwnerIds = [...new Set(prismaProjects.map((p) => p.ownerId))];
		const tierResults = await Promise.all(
			uniqueOwnerIds.map(async (ownerId) => ({
				ownerId,
				tier: await getOwnerTier(ownerId),
			})),
		);
		const ownerTierMap = new Map<string, SubscriptionTier>(
			tierResults.map((r) => [r.ownerId, r.tier]),
		);

		// Cache storageInfo per owner (multiple projects may share the same owner)
		const storageInfoMap = new Map<
			string,
			Awaited<ReturnType<typeof getOwnerStorageInfo>>
		>();
		await Promise.all(
			uniqueOwnerIds.map(async (ownerId) => {
				const ownerTier = ownerTierMap.get(ownerId) ?? "FREE";
				storageInfoMap.set(
					ownerId,
					await getOwnerStorageInfo(ownerId, ownerTier),
				);
			}),
		);

		const projects = await Promise.all(
			prismaProjects.map(async (project) => {
				const ownerTier = ownerTierMap.get(project.ownerId) ?? "FREE";
				const memberLimitInfo = await getProjectMemberLimitInfo(
					project,
					ownerTier,
				);
				const storageInfo = storageInfoMap.get(project.ownerId);
				return serializeProject(project, user.id, memberLimitInfo, storageInfo);
			}),
		);

		return { projects };
	},
});
