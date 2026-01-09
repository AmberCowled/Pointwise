import prisma from "@pointwise/lib/prisma";
import type { SearchableUser } from "@pointwise/lib/validation/users-schema";

export async function searchUsers(
	query?: string,
	limit: number = 50,
	offset: number = 0,
	sortBy: "relevance" | "recent" | "popular" = "relevance",
): Promise<{ users: SearchableUser[]; total: number }> {
	const searchTerm = query?.trim();

	// Use MongoDB text search if query provided, otherwise use regular Prisma query
	if (searchTerm) {
		// Use MongoDB $text search via findRaw for case-insensitive text search
		// For relevance sorting, we can limit results early. For other sorts, we need all matches first.
		const maxFetchLimit = 1000; // Reasonable max to prevent excessive memory usage
		const fetchLimit =
			sortBy === "relevance"
				? Math.min(offset + limit, maxFetchLimit)
				: maxFetchLimit;

		const rawResults = await prisma.user.findRaw({
			filter: {
				$and: [
					{ name: { $exists: true, $ne: null } },
					{ profileVisibility: "PUBLIC" },
					{ $text: { $search: searchTerm } },
				],
			},
			options: {
				limit: fetchLimit,
				sort: { score: { $meta: "textScore" } }, // Use textScore to get matches
			},
		});

		// Get all matching IDs from text search
		const allMatchingIds = (
			rawResults as unknown as { _id: { $oid: string } }[]
		).map((doc) => doc._id.$oid);

		// Fetch full typed data for all matching IDs (or limited if relevance)
		const allUsers = await prisma.user.findMany({
			where: {
				id: { in: allMatchingIds },
				name: { not: null },
				profileVisibility: "PUBLIC",
			},
			select: {
				id: true,
				name: true,
				image: true,
				xp: true,
				updatedAt: true,
			},
		});

		// Sort users based on sortBy preference
		if (sortBy === "relevance") {
			// Preserve text search relevance order from MongoDB
			const idOrder = new Map(allMatchingIds.map((id, index) => [id, index]));
			allUsers.sort((a, b) => {
				const aIndex = idOrder.get(a.id) ?? Infinity;
				const bIndex = idOrder.get(b.id) ?? Infinity;
				return aIndex - bIndex;
			});
		} else if (sortBy === "popular") {
			// Sort by XP descending
			allUsers.sort((a, b) => b.xp - a.xp);
		} else {
			// Sort by updatedAt descending (recent)
			allUsers.sort((a, b) => {
				const aUpdated = a.updatedAt.getTime();
				const bUpdated = b.updatedAt.getTime();
				return bUpdated - aUpdated;
			});
		}

		// Apply offset and limit after sorting
		const users = allUsers.slice(offset, offset + limit);

		// Get total count for text search results using aggregation
		const countResult = await prisma.user.aggregateRaw({
			pipeline: [
				{
					$match: {
						$and: [
							{ name: { $exists: true, $ne: null } },
							{ profileVisibility: "PUBLIC" },
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
			users: users.map((u) => ({
				id: u.id,
				name: u.name,
				image: u.image,
				xp: u.xp,
			})),
			total,
		};
	}

	let orderBy: { updatedAt: "desc" } | { xp: "desc" } | { name: "asc" } = {
		updatedAt: "desc",
	};

	if (sortBy === "popular") {
		orderBy = { xp: "desc" };
	} else if (sortBy === "recent") {
		orderBy = { updatedAt: "desc" };
	}

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where: {
				profileVisibility: "PUBLIC",
			},
			select: {
				id: true,
				name: true,
				image: true,
				xp: true,
				updatedAt: true,
			},
			orderBy,
			take: limit,
			skip: offset,
		}),
		prisma.user.count({ where: { profileVisibility: "PUBLIC" } }),
	]);

	return {
		users: users.map((u) => ({
			id: u.id,
			name: u.name,
			image: u.image,
			xp: u.xp,
		})),
		total,
	};
}
