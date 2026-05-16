import { ApiError } from "@pointwise/lib/api/errors";
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
	handler: async ({ body, user }) => {
		const suggestions = await getTaskSuggestions(
			body.goal ?? null,
			body.existingTasks ?? [],
			body.userPrompt?.trim() ?? null,
			user.id,
			body.projectId,
		);

		if (suggestions === null) {
			throw new ApiError("Failed to generate task suggestions", 400);
		}

		return { suggestions };
	},
});
