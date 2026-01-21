import { utapi } from "@pointwise/lib/api/utapi";
import prisma from "@pointwise/lib/prisma";
import {
	type SearchableUser,
	SearchableUserSchema,
	type User,
	UserSchema,
} from "@pointwise/lib/validation/users-schema";

// Word list for generating display names
const DISPLAY_NAME_WORDS = [
	"Creative",
	"Bold",
	"Swift",
	"Brilliant",
	"Dynamic",
	"Elegant",
	"Fierce",
	"Graceful",
	"Innovative",
	"Jovial",
	"Keen",
	"Lively",
	"Majestic",
	"Noble",
	"Optimistic",
	"Pioneering",
	"Quick",
	"Radiant",
	"Savvy",
	"Tenacious",
	"Unique",
	"Vibrant",
	"Wise",
	"Xenon",
	"Yielding",
	"Zealous",
	"Adventurous",
	"Brave",
	"Courageous",
	"Daring",
	"Energetic",
	"Fearless",
	"Gallant",
	"Heroic",
	"Intrepid",
	"Jubilant",
	"Kind",
	"Loyal",
	"Mighty",
	"Nimble",
	"Outstanding",
	"Powerful",
	"Resilient",
	"Strong",
	"Thriving",
	"Unyielding",
	"Victorious",
	"Witty",
	"Xenial",
	"Youthful",
	"Zestful",
];

/**
 * Generate a unique display name by combining a random word with a random number suffix.
 * Ensures uniqueness by checking against existing display names in the database.
 */
export async function generateUniqueDisplayName(): Promise<string> {
	let attempts = 0;
	const maxAttempts = 100; // Prevent infinite loops

	while (attempts < maxAttempts) {
		const word =
			DISPLAY_NAME_WORDS[Math.floor(Math.random() * DISPLAY_NAME_WORDS.length)];
		const suffix = Math.floor(Math.random() * 9999) + 1; // 1-9999
		const displayName = `${word}${suffix}`;

		// Check if this display name already exists
		const existing = await prisma.user.findFirst({
			where: { displayName },
			select: { id: true },
		});

		if (!existing) {
			return displayName;
		}

		attempts++;
	}

	// Fallback: use timestamp-based unique name if we can't find a unique combination
	return `User${Date.now()}`;
}

/**
 * Check if a display name is available (not taken by another user).
 * Case-insensitive check.
 */
export async function isDisplayNameAvailable(
	displayName: string,
	currentUserId?: string,
): Promise<boolean> {
	const trimmedName = displayName.trim();
	if (!trimmedName) return false;

	const existing = await prisma.user.findFirst({
		where: {
			displayName: {
				equals: trimmedName,
				mode: "insensitive",
			},
			...(currentUserId ? { id: { not: currentUserId } } : {}),
		},
		select: { id: true },
	});

	return !existing;
}

export async function getUser(id: string): Promise<User> {
	// First, check if user exists and has displayName
	const userCheck = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			displayName: true,
		},
	});

	if (!userCheck) {
		throw new Error("User not found");
	}

	// Generate displayName if missing
	if (!userCheck.displayName || userCheck.displayName.trim() === "") {
		const displayName = await generateUniqueDisplayName();
		await prisma.user.update({
			where: { id },
			data: { displayName },
		});
	}

	// Now safely get all user data knowing displayName exists
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
			displayName: true,
			bio: true,
			location: true,
			website: true,
			gender: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	// Transform emailVerified from DateTime | null to boolean
	const transformedUser = {
		...userData,
		emailVerified: userData.emailVerified !== null,
	};

	return UserSchema.parse(transformedUser);
}

/**
 * Update user profile fields (excluding password and email)
 */
export async function updateUserProfile(
	userId: string,
	profileData: {
		displayName: string;
		bio?: string | null;
		location?: string | null;
		website?: string | null;
		profileVisibility: "PRIVATE" | "PUBLIC";
		image?: string | null;
		gender?: string | null;
	},
): Promise<User> {
	// Check if displayName is unique if it's being changed
	const currentuser = await prisma.user.findUnique({
		where: { id: userId },
		select: { displayName: true, image: true },
	});

	if (
		currentuser &&
		currentuser.displayName.toLowerCase() !==
			profileData.displayName.toLowerCase()
	) {
		const available = await isDisplayNameAvailable(
			profileData.displayName,
			userId,
		);
		if (!available) {
			throw new Error("DISPLAY_NAME_TAKEN");
		}
	}

	// Handle old image deletion if it changed
	// We only delete if profileData.image is explicitly provided (string or null)
	// and it's different from the current active image.
	if (
		currentuser &&
		profileData.image !== undefined &&
		currentuser.image !== profileData.image
	) {
		const oldImage = currentuser.image;
		if (
			oldImage &&
			(oldImage.includes("utfs.io") || oldImage.includes("ufs.sh"))
		) {
			const fileKey = oldImage.split("/f/")[1]?.split("?")[0];
			if (fileKey) {
				try {
					await utapi.deleteFiles(fileKey);
					console.log("Deleted old profile picture:", fileKey);
				} catch (error) {
					console.error("Failed to delete old profile picture:", error);
				}
			}
		}
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			displayName: profileData.displayName,
			bio: profileData.bio,
			location: profileData.location,
			website: profileData.website,
			profileVisibility: profileData.profileVisibility,
			image: profileData.image,
			gender: profileData.gender,
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			profileVisibility: true,
			xp: true,
			emailVerified: true,
			displayName: true,
			bio: true,
			location: true,
			website: true,
			gender: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	// Transform emailVerified from DateTime | null to boolean
	const transformedUser = {
		...updatedUser,
		emailVerified: updatedUser.emailVerified !== null,
	};

	return UserSchema.parse(transformedUser);
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
				OR: [
					{ name: { contains: searchTerm, mode: "insensitive" } },
					{ displayName: { contains: searchTerm, mode: "insensitive" } },
				],
				...(excludeUserId ? { id: { not: excludeUserId } } : {}),
			},
			take: limit,
			skip: offset,
			select: {
				id: true,
				displayName: true,
				image: true,
				xp: true,
			},
		});
		return {
			users: SearchableUserSchema.array().parse(users),
			total: users.length,
		};
	}

	return { users: [], total: 0 } as { users: User[]; total: number };
}
