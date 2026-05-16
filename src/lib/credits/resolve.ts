import prisma from "@pointwise/lib/prisma";
import type { ProjectCreditPolicy } from "@prisma/client";
import { getOrAddBalance } from "./balance";

export type CreditDenialReason = "NO_CREDITS" | "CAP_EXCEEDED";

export type BillingSource = "MEMBER" | "OWNER" | "MEMBER_FALLBACK";

export interface CreditResolution {
	billedUserId: string;
	canProceed: boolean;
	source: BillingSource;
	denialReason?: CreditDenialReason;
	remainingCredits: number;
	creditPolicy: ProjectCreditPolicy | "NONE";
}

export async function getMemberUsageOfOwnerCredits(
	ownerId: string,
	memberId: string,
	periodStart: Date,
	periodEnd: Date,
): Promise<number> {
	const result = await prisma.aiUsageEvent.aggregate({
		where: {
			billedUserId: ownerId,
			userId: memberId,
			creditsCharged: { gt: 0 },
			createdAt: { gte: periodStart, lte: periodEnd },
		},
		_sum: { creditsCharged: true },
	});
	return result._sum.creditsCharged ?? 0;
}

export async function resolveCredits(
	userId: string,
	projectId?: string | null,
): Promise<CreditResolution> {
	// No project context — bill the member directly
	if (!projectId) {
		const balance = await getOrAddBalance(userId);
		const remaining = Math.max(0, balance.totalCredits - balance.usedCredits);
		return {
			billedUserId: userId,
			canProceed: remaining > 0,
			source: "MEMBER",
			denialReason: remaining > 0 ? undefined : "NO_CREDITS",
			remainingCredits: remaining,
			creditPolicy: "NONE",
		};
	}

	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		select: { ownerId: true, creditPolicy: true, memberCreditCap: true },
	});

	// MEMBER_CREDITS policy — member always pays
	if (project.creditPolicy === "MEMBER_CREDITS") {
		const balance = await getOrAddBalance(userId);
		const remaining = Math.max(0, balance.totalCredits - balance.usedCredits);
		return {
			billedUserId: userId,
			canProceed: remaining > 0,
			source: "MEMBER",
			denialReason: remaining > 0 ? undefined : "NO_CREDITS",
			remainingCredits: remaining,
			creditPolicy: "MEMBER_CREDITS",
		};
	}

	// OWNER_CREDITS policy
	const ownerBalance = await getOrAddBalance(project.ownerId);
	const ownerRemaining = Math.max(
		0,
		ownerBalance.totalCredits - ownerBalance.usedCredits,
	);

	// If requester IS the owner, bill owner directly
	if (userId === project.ownerId) {
		return {
			billedUserId: project.ownerId,
			canProceed: ownerRemaining > 0,
			source: "OWNER",
			denialReason: ownerRemaining > 0 ? undefined : "NO_CREDITS",
			remainingCredits: ownerRemaining,
			creditPolicy: "OWNER_CREDITS",
		};
	}

	// Member requesting under OWNER_CREDITS — check cap if set
	if (
		project.memberCreditCap != null &&
		ownerBalance.periodStart &&
		ownerBalance.periodEnd
	) {
		const used = await getMemberUsageOfOwnerCredits(
			project.ownerId,
			userId,
			ownerBalance.periodStart,
			ownerBalance.periodEnd,
		);
		if (used >= project.memberCreditCap) {
			// Cap exceeded — fall back to member's own credits
			const memberBalance = await getOrAddBalance(userId);
			const memberRemaining = Math.max(
				0,
				memberBalance.totalCredits - memberBalance.usedCredits,
			);
			return {
				billedUserId: memberRemaining > 0 ? userId : userId,
				canProceed: memberRemaining > 0,
				source: "MEMBER_FALLBACK",
				denialReason: memberRemaining > 0 ? undefined : "CAP_EXCEEDED",
				remainingCredits: memberRemaining,
				creditPolicy: "OWNER_CREDITS",
			};
		}
	}

	// Owner has credits — bill owner
	if (ownerRemaining > 0) {
		return {
			billedUserId: project.ownerId,
			canProceed: true,
			source: "OWNER",
			remainingCredits: ownerRemaining,
			creditPolicy: "OWNER_CREDITS",
		};
	}

	// Owner exhausted — fall back to member's own credits
	const memberBalance = await getOrAddBalance(userId);
	const memberRemaining = Math.max(
		0,
		memberBalance.totalCredits - memberBalance.usedCredits,
	);
	return {
		billedUserId: userId,
		canProceed: memberRemaining > 0,
		source: "MEMBER_FALLBACK",
		denialReason: memberRemaining > 0 ? undefined : "NO_CREDITS",
		remainingCredits: memberRemaining,
		creditPolicy: "OWNER_CREDITS",
	};
}
