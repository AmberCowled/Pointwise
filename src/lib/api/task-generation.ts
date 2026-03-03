import { CORE_TASK_CATEGORIES } from "@pointwise/lib/categories";
import { callGemini } from "@pointwise/lib/llm/gemini";
import type {
	ExistingTask,
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
): Promise<TaskSuggestion[] | null> {
	const prompt = buildTaskSuggestionsPrompt(goal, existingTasks, userPrompt);
	const { success, response } = await callGemini(prompt);
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
): Promise<TaskExpandResponse | null> {
	const prompt = buildTaskExpansionPrompt(goal, title, summary);
	const { success, response } = await callGemini(prompt);
	if (!success || !response) return null;
	return parseExpandFromResponse(response);
}
