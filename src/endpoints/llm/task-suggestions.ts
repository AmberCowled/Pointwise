import { getTaskSuggestions } from "@pointwise/lib/api/task-generation";
import type { TaskSuggestionsResponse } from "@pointwise/lib/validation/task-generation-schema";
import {
	type TaskSuggestionsRequest,
	TaskSuggestionsRequestSchema,
} from "@pointwise/lib/validation/task-generation-schema";
import { endpoint } from "ertk";

export default endpoint.post<TaskSuggestionsResponse, TaskSuggestionsRequest>({
	name: "getTaskSuggestions",
	request: TaskSuggestionsRequestSchema,
	protected: true,
	query: (body) => ({ url: "/llm/task-suggestions", method: "POST", body }),
	handler: async ({ body }) => {
		const suggestions = await getTaskSuggestions(
			body.goal ?? null,
			body.existingTasks ?? [],
			body.userPrompt?.trim() ?? null,
		);

		if (suggestions === null) {
			const err = new Error("Failed to generate task suggestions");
			(err as Error & { status: number }).status = 400;
			throw err;
		}

		return { suggestions };
	},
});
