import { ApiError } from "@pointwise/lib/api/errors";
import prisma from "@pointwise/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";
import { resolveUserTier } from "./balance";
import { TIER_CONFIG } from "./config";
import { getOwnerTier } from "./member-limits";

/**
 * Get the combined storage used across a user's personal uploads
 * and all projects they own. This is the single pool that counts
 * against their tier limit.
 */
async function getTotalStorageUsed(userId: string): Promise<number> {
	const [user, projects] = await Promise.all([
		prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: { storageBytesUsed: true },
		}),
		prisma.project.findMany({
			where: { ownerId: userId },
			select: { storageBytesUsed: true },
		}),
	]);

	const personal = Number(user.storageBytesUsed);
	const projectTotal = projects.reduce(
		(sum, p) => sum + Number(p.storageBytesUsed),
		0,
	);
	return personal + projectTotal;
}

// --- Increment / Decrement (track bytes in the relevant container) ---

export async function incrementProjectStorage(
	projectId: string,
	bytes: number,
): Promise<void> {
	await prisma.project.update({
		where: { id: projectId },
		data: { storageBytesUsed: { increment: bytes } },
	});
}

export async function decrementProjectStorage(
	projectId: string,
	bytes: number,
): Promise<void> {
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		select: { storageBytesUsed: true },
	});
	const current = Number(project.storageBytesUsed);
	await prisma.project.update({
		where: { id: projectId },
		data: { storageBytesUsed: Math.max(0, current - bytes) },
	});
}

export async function incrementUserStorage(
	userId: string,
	bytes: number,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: { storageBytesUsed: { increment: bytes } },
	});
}

export async function decrementUserStorage(
	userId: string,
	bytes: number,
): Promise<void> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: { storageBytesUsed: true },
	});
	const current = Number(user.storageBytesUsed);
	await prisma.user.update({
		where: { id: userId },
		data: { storageBytesUsed: Math.max(0, current - bytes) },
	});
}

// --- Enforcement (single pool: personal + all owned projects) ---

export async function enforceProjectFileUpload(
	projectId: string,
	fileSize: number,
): Promise<void> {
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		select: { ownerId: true },
	});

	const tier = await getOwnerTier(project.ownerId);
	const config = TIER_CONFIG[tier];

	if (fileSize > config.maxFileSizeBytes) {
		throw new ApiError(
			`File exceeds the maximum upload size for the ${tier} tier.`,
			413,
		);
	}

	const totalUsed = await getTotalStorageUsed(project.ownerId);
	if (totalUsed + fileSize > config.storageBytes) {
		throw new ApiError(
			"Storage limit reached.\nProject owner needs to upgrade their plan.",
			413,
		);
	}
}

export async function enforceUserFileUpload(
	userId: string,
	fileSize: number,
): Promise<void> {
	const userTier = await resolveUserTier(userId);
	const config = TIER_CONFIG[userTier.tier];

	if (fileSize > config.maxFileSizeBytes) {
		throw new ApiError(
			`File exceeds the maximum upload size for the ${userTier.tier} tier.`,
			413,
		);
	}

	const totalUsed = await getTotalStorageUsed(userId);
	if (totalUsed + fileSize > config.storageBytes) {
		throw new ApiError(
			"Storage limit reached.\nUpgrade your plan to upload more files.",
			413,
		);
	}
}

// --- Info (for serialization / frontend display) ---

export async function getOwnerStorageInfo(
	ownerId: string,
	ownerTier?: SubscriptionTier,
): Promise<{
	used: number;
	limit: number;
	percentage: number;
	exceeded: boolean;
	ownerTier: string;
}> {
	const tier = ownerTier ?? (await getOwnerTier(ownerId));
	const limit = TIER_CONFIG[tier].storageBytes;
	const used = await getTotalStorageUsed(ownerId);
	const percentage =
		limit === Number.POSITIVE_INFINITY ? 0 : Math.round((used / limit) * 100);

	return {
		used,
		limit,
		percentage,
		exceeded: used > limit,
		ownerTier: tier,
	};
}
