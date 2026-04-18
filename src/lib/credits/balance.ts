import prisma from "@pointwise/lib/prisma";
import { PERIOD_DAYS, TIER_CONFIG } from "./config";

const MS_PER_PERIOD = PERIOD_DAYS * 24 * 60 * 60 * 1000;

function getCurrentPeriod(anchor: Date) {
	const now = Date.now();
	const periods = Math.floor((now - anchor.getTime()) / MS_PER_PERIOD);
	const start = new Date(anchor.getTime() + periods * MS_PER_PERIOD);
	const end = new Date(start.getTime() + MS_PER_PERIOD);
	return { start, end };
}

async function resolveUserTier(userId: string) {
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
		return prisma.userTier.update({
			where: { id: userTier.id },
			data: {
				tier: userTier.pendingTier,
				tierChangedAt: userTier.pendingChangeAt,
				pendingTier: null,
				pendingChangeAt: null,
				periodStart: null,
				periodEnd: null,
			},
		});
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
