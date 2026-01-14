import prisma from "@pointwise/lib/prisma";
import {
	type SearchableUser,
	SearchableUserSchema,
	type User,
	UserSchema,
} from "@pointwise/lib/validation/users-schema";

export async function getUser(id: string): Promise<User> {
	const userData = await prisma.user.findUniqueOrThrow({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			profileVisibility: true,
			xp: true,
			emailVerified: true,
			createdAt: true,
			updatedAt: true,
		},
	});
	return UserSchema.parse(userData);
}

export async function searchUsers(
	query?: string,
	limit: number = 50,
	offset: number = 0,
	excludeUserId?: string,
): Promise<{ users: SearchableUser[]; total: number }> {
	const searchTerm = query?.trim();

	if (searchTerm) {
		const users = await prisma.user.findMany({
			where: {
				profileVisibility: "PUBLIC",
				name: { contains: searchTerm, mode: "insensitive" },
				...(excludeUserId ? { id: { not: excludeUserId } } : {}),
			},
			take: limit,
			skip: offset,
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				profileVisibility: true,
				xp: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		return {
			users: SearchableUserSchema.array().parse(users),
			total: users.length,
		};
	}

	return { users: [], total: 0 } as { users: User[]; total: number };
}
