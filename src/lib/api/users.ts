import prisma from "@pointwise/lib/prisma";
import type { User } from "@pointwise/lib/validation/users-schema";

export async function searchUsers(
	query?: string,
	limit: number = 50,
	offset: number = 0,
): Promise<{ users: User[]; total: number }> {
	const searchTerm = query?.trim();

	if (searchTerm) {
		const users = await prisma.user.findMany({
			where: {
				profileVisibility: "PUBLIC",
				name: { contains: searchTerm, mode: "insensitive" },
			},
			take: limit,
			skip: offset,
		});
		return { users, total: users.length };
	}

	return { users: [], total: 0 };
}
