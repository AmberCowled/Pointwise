import { getXpSuggestion } from "@pointwise/lib/api/xp";
import type { XpSuggestionRequest } from "@pointwise/lib/validation/xp-schema";
import { XpSuggestionRequestSchema } from "@pointwise/lib/validation/xp-schema";
import { endpoint } from "ertk";

export default endpoint.post<{ xp: number }, XpSuggestionRequest>({
	name: "getXpSuggestion",
	request: XpSuggestionRequestSchema,
	protected: true,
	query: (body) => ({ url: "/llm/xp-suggestion", method: "POST", body }),
	handler: async ({ body }) => {
		const xp = await getXpSuggestion(
			body.goal ?? null,
			body.taskName.trim(),
			body.description?.trim() ?? null,
		);

		if (xp === null) {
			const err = new Error("Failed to get XP suggestion");
			(err as Error & { status: number }).status = 400;
			throw err;
		}

		return { xp };
	},
});
