import type { SubscriptionTier } from "@prisma/client";

interface TierConfig {
	credits: number;
	maxProjects: number;
	usersPerProject: number;
	storageBytes: number;
	maxFileSizeBytes: number;
}

export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
	FREE: {
		credits: 30,
		maxProjects: 5,
		usersPerProject: 2,
		storageBytes: 50 * 1024 * 1024,
		maxFileSizeBytes: 5 * 1024 * 1024,
	},
	PLUS: {
		credits: 300,
		maxProjects: 25,
		usersPerProject: 10,
		storageBytes: 500 * 1024 * 1024,
		maxFileSizeBytes: 25 * 1024 * 1024,
	},
	PRO: {
		credits: 1000,
		maxProjects: Infinity,
		usersPerProject: 50,
		storageBytes: 2 * 1024 * 1024 * 1024,
		maxFileSizeBytes: 100 * 1024 * 1024,
	},
	ENTERPRISE: {
		credits: 9999,
		maxProjects: Infinity,
		usersPerProject: 9999,
		storageBytes: 10 * 1024 * 1024 * 1024,
		maxFileSizeBytes: 500 * 1024 * 1024,
	},
};

export const PERIOD_DAYS = 30;
