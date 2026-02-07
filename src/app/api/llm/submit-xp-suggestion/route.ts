import { isProjectUserOrHigher } from "@pointwise/lib/api/projects";
import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import {
	enqueue,
	hasPendingXpSuggestionForTask,
} from "@pointwise/lib/llm/queue-service";
import prisma from "@pointwise/lib/prisma";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import type { processLlmQueue } from "~/trigger/process-llm-queue";

const SubmitXpSuggestionSchema = z.object({
	taskId: z.string().min(1, "Task ID is required"),
});

function buildXpPrompt(
	goal: string | null,
	taskName: string,
	description: string | null,
) {
	return `You are assigning an XP reward for completing a task.
  
  Output ONLY a single integer (no text) between 25 and 1000000.
  
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

/**
 * POST /api/llm/submit-xp-suggestion
 * Enqueue an AI XP suggestion request for a task. Returns requestId.
 * Returns 409 if an XP suggestion is already in progress for this task.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { taskId } = body as z.infer<typeof SubmitXpSuggestionSchema>;

			const task = await prisma.task.findUnique({
				where: { id: taskId },
				include: { project: true },
			});

			if (!task) {
				return errorResponse("Task not found", 404);
			}

			if (!(await isProjectUserOrHigher(task.projectId, user.id))) {
				return errorResponse(
					"Forbidden: You do not have access to this task",
					403,
				);
			}

			if (await hasPendingXpSuggestionForTask(taskId)) {
				return errorResponse("XP suggestion already in progress", 409);
			}

			const prompt = buildXpPrompt(
				task.project.goal,
				task.title,
				task.description,
			);

			// Update task first so UI reflects AI_PENDING; then enqueue.
			// Avoids Prisma transactions (require MongoDB replica set - breaks on standalone/Atlas M0).
			// Duplicate prevention: hasPending check above + client-side loading guard on retry badge.
			await prisma.task.update({
				where: { id: taskId },
				data: { xpAwardSource: "AI_PENDING" },
			});

			const requestId = await enqueue(user.id, prompt, "xp-reward", taskId);

			// Fire-and-forget: Trigger.dev processes the queue (no Vercel timeout)
			tasks.trigger<typeof processLlmQueue>("process-llm-queue", undefined);

			return jsonResponse({ requestId }, 201);
		},
		SubmitXpSuggestionSchema,
	);
}
