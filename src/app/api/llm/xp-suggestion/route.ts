import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { getXpSuggestion } from "@pointwise/lib/api/xp";
import { XpSuggestionRequestSchema } from "@pointwise/lib/validation/xp-schema";

/**
 * POST /api/llm/xp-suggestion
 * Get AI XP suggestion for a task. Client passes goal, taskName, and description.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ body }) => {
			const xp = await getXpSuggestion(
				body.goal ?? null,
				body.taskName.trim(),
				body.description?.trim() ?? null,
			);

			if (xp === null) {
				return errorResponse("Failed to get XP suggestion", 400);
			}

			return jsonResponse({ xp });
		},
		XpSuggestionRequestSchema,
	);
}
