import { callGemini } from "@pointwise/lib/llm/gemini";
import prisma from "@pointwise/lib/prisma";
import {
	type UpdateXPRequest,
	type XP,
	XP_SCHEMA,
} from "@pointwise/lib/validation/xp-schema";
import { ApiError } from "./errors";

type XpCurve = { BASE: number; GROWTH: number; version: string };

const MAX_LEVEL = 100;
const XP_CURVE: XpCurve = { BASE: 100, GROWTH: 1.5, version: "v1" };

function xpToNext(level: number, curve = XP_CURVE): number {
	const L = Math.max(1, Math.floor(level));
	return Math.floor(curve.BASE * L ** curve.GROWTH);
}

const STARTS: number[] = (() => {
	const arr = new Array(MAX_LEVEL + 2).fill(0);
	let cum = 0;
	arr[1] = 0;
	for (let L = 1; L <= MAX_LEVEL; L++) {
		cum += xpToNext(L);
		arr[L + 1] = cum;
	}
	return arr;
})();

function calculateLevelFromXp(totalXp: number) {
	const xp = Math.max(0, Math.floor(totalXp));

	let lo = 1,
		hi = MAX_LEVEL + 1,
		level = 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (STARTS[mid] <= xp) {
			level = mid;
			lo = mid + 1;
		} else hi = mid - 1;
	}
	if (level > MAX_LEVEL) level = MAX_LEVEL;

	const start = STARTS[level];
	const nextStart =
		level < MAX_LEVEL ? STARTS[level + 1] : STARTS[MAX_LEVEL + 1];
	const xpIntoLevel = Math.max(0, xp - start);
	const xpToNext = Math.max(0, nextStart - start);
	const progress =
		level < MAX_LEVEL && xpToNext > 0 ? xpIntoLevel / xpToNext : 1;

	return { level, progress, xpIntoLevel, xpToNext, start, nextStart };
}

/**
 * Build the prompt for AI XP suggestion based on project goal, task name, and description.
 */
export function buildXpSuggestionPrompt(
	goal: string | null,
	taskName: string,
	description: string | null,
): string {
	return `You are assigning an XP reward for completing a task.
  
  Output ONLY a single integer (no text) between 0 and 1000000.
  
  XP represents:
  - Time required
  - Mental or physical effort
  - Difficulty and persistence
  - Impact on the person's broader goal or life
  
  IMPORTANT CONSTRAINTS:
  - Most normal tasks should fall below 10000 XP.
  - Values above 100000 XP are EXTREMELY rare and should only be used for life-altering, multi-year, or near-impossible achievements.
  - A task that could reasonably be completed within weeks or months should NOT exceed 50000 XP.
  
  XP SCALE (use these as anchors):
  - 0: optional items, no meaningful effort, or tasks that contribute nothing to the goal
  - 25–200: trivial or routine tasks
  - 200–800: small but useful tasks
  - 800–3000: meaningful effort or clear progress
  - 3000–10000: challenging tasks requiring focus and commitment
  - 10000–50000: major milestones or sustained effort over a long period
  - 50000–150000: transformational achievements with long-term impact
  - 150000–1000000: nearly impossible, life-defining, or world-changing accomplishments
  
  When deciding XP, consider:
  - How hard this would be for an average person
  - How long it would realistically take
  - Whether it represents incremental progress or a major turning point
  - How much it advances the stated goal
  
  Project goal:
  ${goal || "Not specified"}
  
  Task name:
  ${taskName}
  
  Task description:
  ${description || "None"}`;
}

function parseXpFromResponse(response: string): number | null {
	const match = response.trim().match(/\d+/);
	if (!match) return null;
	const xp = parseInt(match[0], 10);
	if (Number.isNaN(xp) || xp < 0 || xp > 1_000_000) return null;
	return xp;
}

/**
 * Get AI XP suggestion for a task. Calls Gemini with the built prompt.
 *
 * @param goal - Project or broader goal context
 * @param taskName - Task name
 * @param description - Task description
 * @returns XP value (0–1_000_000) or null on failure
 */
export async function getXpSuggestion(
	goal: string | null,
	taskName: string,
	description: string | null,
): Promise<number | null> {
	const prompt = buildXpSuggestionPrompt(goal, taskName, description);
	const { success, response } = await callGemini(prompt);
	if (!success || !response) return null;
	return parseXpFromResponse(response);
}

/**
 * Get XP data for a user by ID
 *
 * @param userId - User ID to fetch XP for
 * @returns XP data with level, progress, and related values
 */
export async function getXP(userId: string): Promise<number> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { xp: true },
	});

	const xp = user?.xp ?? 0;
	return xp;
}

/**
 * Award XP for task completion and create an immutable XPEvent.
 * Updates User.xp and creates XPEvent with snapshot of task/project metadata.
 *
 * @param userId - User ID to award XP to
 * @param xpAwarded - XP amount
 * @param projectName - Project name at time of completion (nullable)
 * @param taskName - Task title
 * @param taskCategory - Task category (nullable)
 * @returns New total XP for user
 */
export async function awardXpForTaskCompletion(
	userId: string,
	xpAwarded: number,
	projectName: string | null,
	taskName: string,
	taskCategory: string | null,
): Promise<number> {
	if (xpAwarded <= 0) {
		return await getXP(userId);
	}

	await prisma.$transaction([
		prisma.xPEvent.create({
			data: {
				userId,
				projectName,
				taskName,
				taskCategory,
				xpAwarded,
			},
		}),
		prisma.user.update({
			where: { id: userId },
			data: { xp: { increment: xpAwarded } },
		}),
	]);

	return await getXP(userId);
}

/**
 * Update XP for a user by ID
 *
 * @param userId - User ID to update XP for
 * @param UpdateXPRequest - Request containing either value or delta
 * @returns Updated XP data
 */
export async function updateXP(
	userId: string,
	request: UpdateXPRequest,
): Promise<number> {
	const prismaUser = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: { xp: true },
	});

	let newXP = prismaUser.xp;
	if (request.value !== undefined) {
		newXP = request.value;
	} else if (request.delta !== undefined) {
		newXP = prismaUser.xp + request.delta;
	}

	if (newXP === prismaUser.xp) {
		throw new ApiError("No XP change", 400);
	}

	const updatedPrismaUser = await prisma.user.update({
		where: { id: userId },
		data: { xp: newXP },
		select: { xp: true },
	});

	return updatedPrismaUser.xp;
}

/**
 * Serialize raw XP value into XP data structure
 *
 * @param xp - Raw XP value from database
 * @returns XP data with level, progress, and related values
 */
export function serializeXP(xp: number): XP {
	const result = calculateLevelFromXp(xp);

	return XP_SCHEMA.parse({
		value: xp,
		lv: result.level,
		toNextLv: result.xpToNext - result.xpIntoLevel, // XP remaining to next level
		nextLvAt: result.nextStart, // Total XP at which next level is reached
		lvStartXP: result.start, // Total XP at which current level started
		progress: Math.round(result.progress * 100), // Convert 0-1 to 0-100 and round to integer
	});
}
