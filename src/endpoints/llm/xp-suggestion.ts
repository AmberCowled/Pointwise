import { ApiError } from "@pointwise/lib/api/errors";
import { getXpSuggestion } from "@pointwise/lib/api/xp";
import type { XpSuggestionRequest } from "@pointwise/lib/validation/xp-schema";
import { XpSuggestionRequestSchema } from "@pointwise/lib/validation/xp-schema";
import { endpoint } from "ertk";

export default endpoint.post<{ xp: number }, XpSuggestionRequest>({
	name: "getXpSuggestion",
	request: XpSuggestionRequestSchema,
	protected: true,
	query: (body) => ({ url: "/llm/xp-suggestion", method: "POST", body }),
	handler: async ({ body, user }) => {
		const xp = await getXpSuggestion(
			body.goal ?? null,
			body.taskName.trim(),
			body.description?.trim() ?? null,
			user.id,
		);

		if (xp === null) {
			throw new ApiError("Failed to get XP suggestion", 400);
		}

		return { xp };
	},
});
