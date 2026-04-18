import prisma from "@pointwise/lib/prisma";
import { emitEvent } from "@pointwise/lib/realtime/publish";
import { PERIOD_DAYS, TIER_CONFIG } from "./config";

const MS_PER_PERIOD = PERIOD_DAYS * 24 * 60 * 60 * 1000;

function getCurrentPeriod(anchor: Date) {
	const now = Date.now();
	const periods = Math.floor((now - anchor.getTime()) / MS_PER_PERIOD);
	const start = new Date(anchor.getTime() + periods * MS_PER_PERIOD);
	const end = new Date(start.getTime() + MS_PER_PERIOD);
	return { start, end };
}

export async function resolveUserTier(userId: string) {
	const userTier = await prisma.userTier.findUnique({
		where: { userId },
	});

	if (!userTier) {
		return prisma.userTier.create({
			data: { userId, tier: "FREE" },
		});
	}

	if (
		userTier.pendingTier &&
		userTier.pendingChangeAt &&
		userTier.pendingChangeAt <= new Date()
	) {
		const updated = await prisma.userTier.update({
			where: { id: userTier.id },
			data: {
				tier: userTier.pendingTier,
				tierChangedAt: userTier.pendingChangeAt,
				pendingTier: null,
				pendingChangeAt: null,
				periodStart: userTier.pendingChangeAt,
				periodEnd: new Date(userTier.pendingChangeAt.getTime() + MS_PER_PERIOD),
			},
		});

		// Notify all members of the owner's projects so memberLimitInfo refreshes
		const projects = await prisma.project.findMany({
			where: { ownerId: userId },
			select: {
				adminUserIds: true,
				projectUserIds: true,
				viewerUserIds: true,
			},
		});
		const memberIds = new Set<string>();
		for (const p of projects) {
			for (const id of [
				...p.adminUserIds,
				...p.projectUserIds,
				...p.viewerUserIds,
			]) {
				if (id !== userId) memberIds.add(id);
			}
		}
		if (memberIds.size > 0) {
			void emitEvent("OWNER_TIER_CHANGED", { ownerId: userId }, [...memberIds]);
		}

		return updated;
	}

	return userTier;
}

export async function getOrAddBalance(userId: string) {
	const userTier = await resolveUserTier(userId);
	const tierCredits = TIER_CONFIG[userTier.tier].credits;
	const now = new Date();

	// Active period exists
	if (userTier.periodEnd && userTier.periodEnd > now) {
		return userTier;
	}

	// No active period — start a new one anchored to tierChangedAt
	const { start, end } = getCurrentPeriod(userTier.tierChangedAt);

	return prisma.userTier.update({
		where: { id: userTier.id },
		data: {
			periodStart: start,
			periodEnd: end,
			totalCredits: tierCredits,
			usedCredits: 0,
		},
	});
}

export async function getRemainingCredits(userId: string) {
	const balance = await getOrAddBalance(userId);
	return {
		used: balance.usedCredits,
		total: balance.totalCredits,
		remaining: Math.max(0, balance.totalCredits - balance.usedCredits),
		periodEnd: balance.periodEnd as Date,
	};
}
