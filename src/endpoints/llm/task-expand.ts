import { expandTaskSuggestion } from "@pointwise/lib/api/task-generation";
import type { TaskExpandResponse } from "@pointwise/lib/validation/task-generation-schema";
import {
	type TaskExpandRequest,
	TaskExpandRequestSchema,
} from "@pointwise/lib/validation/task-generation-schema";
import { endpoint } from "ertk";

export default endpoint.post<TaskExpandResponse, TaskExpandRequest>({
	name: "expandTaskSuggestion",
	request: TaskExpandRequestSchema,
	protected: true,
	query: (body) => ({ url: "/llm/task-expand", method: "POST", body }),
	handler: async ({ body }) => {
		const expanded = await expandTaskSuggestion(
			body.goal ?? null,
			body.title.trim(),
			body.summary.trim(),
		);

		if (expanded === null) {
			const err = new Error("Failed to expand task suggestion");
			(err as Error & { status: number }).status = 400;
			throw err;
		}

		return expanded;
	},
});
