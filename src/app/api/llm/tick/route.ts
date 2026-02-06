import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { tick } from "@pointwise/lib/llm/queue-service";

/**
 * POST /api/llm/tick
 * Process next pending queue entry if cooldown passed. Returns whether work was done.
 */
export async function POST(req: Request) {
	return handleProtectedRoute(req, async () => {
		const processed = await tick();
		return jsonResponse({ processed });
	});
}
