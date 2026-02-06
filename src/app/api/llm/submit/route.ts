import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { enqueue } from "@pointwise/lib/llm/queue-service";
import { SubmitLLMRequestSchema } from "@pointwise/lib/validation/llm-schema";

/**
 * POST /api/llm/submit
 * Enqueue an LLM request. Returns requestId for polling result.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const requestId = await enqueue(user.id, body.prompt, body.feature);
			return jsonResponse({ requestId }, 201);
		},
		SubmitLLMRequestSchema,
	);
}
