/**
 * LLM queue service with concurrency-safe operations.
 * Uses optimistic locking (updateMany with status check) for claim.
 * Lazy recovery resets stuck PROCESSING entries.
 */

import { callGemini } from "@pointwise/lib/llm/gemini";
import prisma from "@pointwise/lib/prisma";
import type { LLMStatus } from "@prisma/client";

const STUCK_PROCESSING_MS = 15_000; // 15 seconds - Gemini typically responds in 2–5s
const COOLDOWN_MS = 4_000; // ~4s cooldown for free tier rate limit

export async function enqueue(
	userId: string,
	prompt: string,
	feature: string,
	taskId?: string,
): Promise<string> {
	const entry = await prisma.lLMQueueEntry.create({
		data: {
			userId,
			prompt,
			feature,
			taskId: taskId ?? null,
			status: "PENDING",
		},
	});
	return entry.id;
}

export async function hasPendingXpSuggestionForTask(
	taskId: string,
): Promise<boolean> {
	const existing = await prisma.lLMQueueEntry.findFirst({
		where: {
			taskId,
			feature: "xp-reward",
			status: { in: ["PENDING", "PROCESSING"] },
		},
		select: { id: true },
	});
	return !!existing;
}

export async function getResult(
	requestId: string,
	userId: string,
): Promise<{
	status: LLMStatus;
	feature: string;
	result?: string;
	error?: string;
	createdAt?: Date;
	processedAt?: Date | null;
	updatedAt?: Date;
} | null> {
	const entry = await prisma.lLMQueueEntry.findFirst({
		where: { id: requestId, userId },
		select: {
			status: true,
			feature: true,
			result: true,
			error: true,
			createdAt: true,
			processedAt: true,
			updatedAt: true,
		},
	});
	if (!entry) return null;
	return {
		status: entry.status,
		feature: entry.feature,
		result: entry.result ?? undefined,
		error: entry.error ?? undefined,
		createdAt: entry.createdAt,
		processedAt: entry.processedAt,
		updatedAt: entry.updatedAt,
	};
}

/** Reset stuck PROCESSING entries (lazy recovery). Unsticks one per tick if any exist. */
async function tryUnstickProcessing(): Promise<void> {
	const cutoff = new Date(Date.now() - STUCK_PROCESSING_MS);
	const stuck = await prisma.lLMQueueEntry.findFirst({
		where: {
			status: "PROCESSING",
			updatedAt: { lt: cutoff },
		},
		orderBy: { updatedAt: "asc" },
		select: { id: true },
	});
	if (stuck) {
		await prisma.lLMQueueEntry.updateMany({
			where: { id: stuck.id, status: "PROCESSING" },
			data: { status: "PENDING" },
		});
	}
}

/** Check if cooldown has passed since last processed. Free tier: ~4s cooldown. */
async function isCooldownPassed(): Promise<boolean> {
	const last = await prisma.lLMQueueEntry.findFirst({
		where: { status: { in: ["DONE", "FAILED"] } },
		orderBy: { processedAt: "desc" },
		select: { processedAt: true },
	});
	if (!last?.processedAt) return true;
	return Date.now() - last.processedAt.getTime() >= COOLDOWN_MS;
}

/**
 * Claim the oldest PENDING entry using optimistic locking.
 * updateMany with id+status ensures only one concurrent tick succeeds.
 */
async function claimNextPending(): Promise<{
	id: string;
	userId: string;
	prompt: string;
	feature: string;
	taskId: string | null;
} | null> {
	const oldest = await prisma.lLMQueueEntry.findFirst({
		where: { status: "PENDING" },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			userId: true,
			prompt: true,
			feature: true,
			taskId: true,
		},
	});
	if (!oldest) return null;

	const { count } = await prisma.lLMQueueEntry.updateMany({
		where: { id: oldest.id, status: "PENDING" },
		data: { status: "PROCESSING" },
	});
	if (count === 0) return null; // Another tick claimed it

	return { ...oldest, taskId: oldest.taskId ?? null };
}

export async function tick(): Promise<boolean> {
	// (a) Lazy recovery: reset stuck PROCESSING
	await tryUnstickProcessing();

	// (b) Check cooldown
	if (!(await isCooldownPassed())) {
		return false;
	}

	// (c) Atomic claim PENDING -> PROCESSING
	const claimed = await claimNextPending();
	if (!claimed) {
		return false;
	}

	// (d) Call Gemini and update
	const { success, response, error } = await callGemini(claimed.prompt);
	const now = new Date();
	await prisma.lLMQueueEntry.update({
		where: { id: claimed.id },
		data: {
			status: success ? "DONE" : "FAILED",
			result: success ? (response ?? null) : null,
			error: success ? null : (error ?? "Unknown error"),
			processedAt: now,
			updatedAt: now,
		},
	});

	// (e) If xp-reward with taskId, update the task
	if (claimed.feature === "xp-reward" && claimed.taskId) {
		if (success && response) {
			const match = response.trim().match(/\d+/);
			const xp = match ? parseInt(match[0], 10) : NaN;
			if (!Number.isNaN(xp) && xp >= 0 && xp <= 1_000_000) {
				await prisma.task.update({
					where: { id: claimed.taskId },
					data: { xpAward: xp, xpAwardSource: "AI_DONE" },
				});
			} else {
				await prisma.task.update({
					where: { id: claimed.taskId },
					data: { xpAwardSource: "AI_FAILED" },
				});
			}
		} else {
			await prisma.task.update({
				where: { id: claimed.taskId },
				data: { xpAwardSource: "AI_FAILED" },
			});
		}
	}

	return true;
}
