import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { getResult } from "@pointwise/lib/llm/queue-service";

/**
 * GET /api/llm/result/[requestId]
 * Return status, feature, result, or error for a queued LLM request.
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;
	return handleProtectedRoute(req, async ({ user }) => {
		const result = await getResult(requestId, user.id);
		if (!result) {
			return errorResponse("Not found", 404);
		}
		return jsonResponse({
			status: result.status,
			feature: result.feature,
			result: result.result,
			error: result.error,
		});
	});
}
