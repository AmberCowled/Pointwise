import { CORE_TASK_CATEGORIES } from "@pointwise/lib/categories";
import { gateCreditUsage } from "@pointwise/lib/credits/gate";
import { callGemini } from "@pointwise/lib/llm/gemini";
import type {
	ExistingTask,
	TaskBreakdownSubtask,
	TaskExpandResponse,
	TaskSuggestion,
} from "@pointwise/lib/validation/task-generation-schema";

// ── Suggestions ──

export function buildTaskSuggestionsPrompt(
	goal: string | null,
	existingTasks: ExistingTask[],
	userPrompt: string | null,
): string {
	const existingSection =
		existingTasks.length > 0
			? `Existing tasks in this project:\n${existingTasks.map((t) => `- "${t.title}" [${t.category}] (${t.status})`).join("\n")}`
			: "No existing tasks yet.";

	const focusSection = userPrompt
		? `The user wants to focus on: ${userPrompt}`
		: "";

	return `You are a task planner for a project management app.

Suggest exactly 3 new tasks for the project described below.
Each suggestion should be distinct from existing tasks and from each other.

Each task must be a discrete, one-time action that can be completed in a single session.
Do NOT suggest tasks that require daily repetition, streaks, or sustained effort over multiple days (e.g. "exercise for 7 days straight", "read every morning for a week").
Instead, suggest concrete, completable actions (e.g. "complete a 30-minute workout", "read chapter 3 of [book]").

Output ONLY a JSON array with exactly 3 objects, each having "title" and "summary" keys.
- "title": A concise task title (3-10 words)
- "summary": A 1-2 sentence description of what the task involves

Do not include any text outside the JSON array. Do not use markdown code fences.

Project goal:
${goal || "Not specified"}

${existingSection}

${focusSection}`.trim();
}

function parseSuggestionsFromResponse(
	response: string,
): TaskSuggestion[] | null {
	try {
		// Strip markdown code fences if present
		const cleaned = response
			.replace(/```json\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();
		const parsed = JSON.parse(cleaned);
		if (!Array.isArray(parsed)) return null;

		const suggestions: TaskSuggestion[] = [];
		for (const item of parsed) {
			if (
				typeof item.title === "string" &&
				item.title.length > 0 &&
				typeof item.summary === "string" &&
				item.summary.length > 0
			) {
				suggestions.push({ title: item.title, summary: item.summary });
			}
		}

		return suggestions.length > 0 ? suggestions : null;
	} catch {
		return null;
	}
}

export async function getTaskSuggestions(
	goal: string | null,
	existingTasks: ExistingTask[],
	userPrompt: string | null,
	userId: string,
	projectId: string,
): Promise<TaskSuggestion[] | null> {
	const prompt = buildTaskSuggestionsPrompt(goal, existingTasks, userPrompt);
	const resolution = await gateCreditUsage(userId, projectId);

	const { success, response } = await callGemini(prompt, {
		userId,
		projectId,
		actionType: "TASK_SUGGESTIONS",
		billedUserId: resolution.billedUserId,
		creditsCharged: 1,
	});
	if (!success || !response) return null;
	return parseSuggestionsFromResponse(response);
}

// ── Expand ──

export function buildTaskExpansionPrompt(
	goal: string | null,
	title: string,
	summary: string,
): string {
	const categoryList = CORE_TASK_CATEGORIES.join(", ");

	return `You are a task planner for a project management app.

Expand the following task suggestion into a full task definition.
The task must describe a discrete, one-time action — not a recurring habit or multi-day streak.
Frame the task as something that can be marked complete after a single effort.

Output ONLY a JSON object with these keys:
- "title": The task title (may refine the original, 3-10 words)
- "description": A detailed, well-structured description using Markdown formatting. Use bullet points, numbered lists, bold text, or headings where appropriate to make the task clear and actionable. Aim for a concise but thorough description (3-8 lines). Do not use code fences or tables unless the task is technical.
- "category": One of [${categoryList}] or a short custom category name (max 60 chars)

Do not include any text outside the JSON object. Do not use markdown code fences around the JSON.

Project goal:
${goal || "Not specified"}

Task to expand:
Title: ${title}
Summary: ${summary}`;
}

function parseExpandFromResponse(response: string): TaskExpandResponse | null {
	try {
		const cleaned = response
			.replace(/```json\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();
		const parsed = JSON.parse(cleaned);
		if (
			typeof parsed.title === "string" &&
			parsed.title.length > 0 &&
			typeof parsed.description === "string" &&
			parsed.description.length > 0 &&
			typeof parsed.category === "string" &&
			parsed.category.length > 0
		) {
			return {
				title: parsed.title,
				description: parsed.description,
				category: parsed.category.slice(0, 60),
			};
		}
		return null;
	} catch {
		return null;
	}
}

export async function expandTaskSuggestion(
	goal: string | null,
	title: string,
	summary: string,
	userId: string,
	projectId: string,
): Promise<TaskExpandResponse | null> {
	const prompt = buildTaskExpansionPrompt(goal, title, summary);
	const resolution = await gateCreditUsage(userId, projectId);

	const { success, response } = await callGemini(prompt, {
		userId,
		projectId,
		actionType: "TASK_EXPAND",
		billedUserId: resolution.billedUserId,
		creditsCharged: 1,
	});
	if (!success || !response) return null;
	return parseExpandFromResponse(response);
}

// ── Breakdown ──

export function buildTaskBreakdownPrompt(
	goal: string | null,
	title: string,
	description: string | null,
): string {
	const categoryList = CORE_TASK_CATEGORIES.join(", ");

	return `You are a task planner for a project management app.

Break the following task into 2-6 smaller, concrete subtasks.
Each subtask must be a discrete, one-time action that can be completed in a single session.
Do NOT create subtasks that require daily repetition, streaks, or sustained effort over multiple days.
Each subtask should be independently completable and together they should cover the full scope of the original task.

Output ONLY a JSON array of objects, each with these keys:
- "title": A concise subtask title (3-10 words)
- "description": A detailed, well-structured description using Markdown formatting. Use bullet points, numbered lists, bold text, or headings where appropriate. Aim for 2-5 lines.
- "category": One of [${categoryList}] or a short custom category name (max 60 chars)

Do not include any text outside the JSON array. Do not use markdown code fences.

Project goal:
${goal || "Not specified"}

Task to break down:
Title: ${title}
Description: ${description || "No description provided"}`;
}

function parseBreakdownFromResponse(
	response: string,
): TaskBreakdownSubtask[] | null {
	try {
		const cleaned = response
			.replace(/```json\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();
		const parsed = JSON.parse(cleaned);
		if (!Array.isArray(parsed)) return null;

		const subtasks: TaskBreakdownSubtask[] = [];
		for (const item of parsed) {
			if (
				typeof item.title === "string" &&
				item.title.length > 0 &&
				typeof item.description === "string" &&
				item.description.length > 0 &&
				typeof item.category === "string" &&
				item.category.length > 0
			) {
				subtasks.push({
					title: item.title,
					description: item.description,
					category: item.category.slice(0, 60),
				});
			}
		}

		return subtasks.length > 0 ? subtasks : null;
	} catch {
		return null;
	}
}

export async function getTaskBreakdown(
	goal: string | null,
	title: string,
	description: string | null,
	userId: string,
	projectId: string,
): Promise<TaskBreakdownSubtask[] | null> {
	const prompt = buildTaskBreakdownPrompt(goal, title, description);
	const resolution = await gateCreditUsage(userId, projectId);

	const { success, response } = await callGemini(prompt, {
		userId,
		projectId,
		actionType: "TASK_BREAKDOWN",
		billedUserId: resolution.billedUserId,
		creditsCharged: 1,
	});
	if (!success || !response) return null;
	return parseBreakdownFromResponse(response);
}
