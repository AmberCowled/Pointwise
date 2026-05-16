/**
 * Thin client for Google Gemini API (free tier).
 * Uses gemini-3-flash-preview. Get a free key at https://aistudio.google.com/apikey
 */

import { GoogleGenAI } from "@google/genai";
import { calculateCostUsd } from "@pointwise/lib/llm/cost";
import prisma from "@pointwise/lib/prisma";
import type { AiActionType } from "@prisma/client";

export const MODEL = "gemini-3-flash-preview";
const TIMEOUT_MS = 60_000;

interface UsageContext {
	userId: string;
	projectId?: string;
	actionType: AiActionType;
	billedUserId?: string;
	creditsCharged?: number;
}

export async function callGemini(
	prompt: string,
	usageContext?: UsageContext,
): Promise<{
	success: boolean;
	response?: string;
	error?: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	};
}> {
	const apiKey = process.env.GEMINI_API_KEY?.trim();
	if (!apiKey) {
		return {
			success: false,
			error:
				"GEMINI_API_KEY is required. Get a free key at https://aistudio.google.com/apikey",
		};
	}

	const ai = new GoogleGenAI({ apiKey });
	const start = performance.now();

	try {
		const response = await Promise.race([
			ai.models.generateContent({ model: MODEL, contents: prompt }),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_MS),
			),
		]);

		const text = response.text;
		if (typeof text === "string" && text.length > 0) {
			const meta = response.usageMetadata;
			const usage =
				meta?.promptTokenCount != null &&
				meta?.candidatesTokenCount != null &&
				meta?.totalTokenCount != null
					? {
							inputTokens: meta.promptTokenCount,
							outputTokens: meta.candidatesTokenCount,
							totalTokens: meta.totalTokenCount,
						}
					: undefined;

			if (usageContext) {
				const inputTokens = usage?.inputTokens ?? 0;
				const outputTokens = usage?.outputTokens ?? 0;
				const creditsCharged = usageContext.creditsCharged ?? 0;
				prisma.aiUsageEvent
					.create({
						data: {
							userId: usageContext.userId,
							billedUserId: usageContext.billedUserId ?? usageContext.userId,
							projectId: usageContext.projectId,
							actionType: usageContext.actionType,
							model: MODEL,
							inputTokens,
							outputTokens,
							costUsd: calculateCostUsd(MODEL, inputTokens, outputTokens),
							creditsCharged,
							success: true,
							durationMs: Math.round(performance.now() - start),
						},
					})
					.catch(() => {});

				if (creditsCharged > 0) {
					prisma.userTier
						.update({
							where: {
								userId: usageContext.billedUserId ?? usageContext.userId,
							},
							data: { usedCredits: { increment: creditsCharged } },
						})
						.catch(() => {});
				}
			}

			return { success: true, response: text, usage };
		}

		if (usageContext) {
			prisma.aiUsageEvent
				.create({
					data: {
						userId: usageContext.userId,
						billedUserId: usageContext.billedUserId ?? usageContext.userId,
						projectId: usageContext.projectId,
						actionType: usageContext.actionType,
						model: MODEL,
						inputTokens: 0,
						outputTokens: 0,
						costUsd: 0,
						creditsCharged: 0,
						success: false,
						durationMs: Math.round(performance.now() - start),
					},
				})
				.catch(() => {});
		}

		return {
			success: false,
			error: "Gemini returned empty response",
		};
	} catch (err) {
		if (usageContext) {
			prisma.aiUsageEvent
				.create({
					data: {
						userId: usageContext.userId,
						billedUserId: usageContext.billedUserId ?? usageContext.userId,
						projectId: usageContext.projectId,
						actionType: usageContext.actionType,
						model: MODEL,
						inputTokens: 0,
						outputTokens: 0,
						costUsd: 0,
						creditsCharged: 0,
						success: false,
						durationMs: Math.round(performance.now() - start),
					},
				})
				.catch(() => {});
		}

		const message = err instanceof Error ? err.message : "Request failed";
		return { success: false, error: message };
	}
}
