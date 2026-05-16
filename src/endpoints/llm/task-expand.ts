import { ApiError } from "@pointwise/lib/api/errors";
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
	handler: async ({ body, user }) => {
		const expanded = await expandTaskSuggestion(
			body.goal ?? null,
			body.title.trim(),
			body.summary.trim(),
			user.id,
			body.projectId,
		);

		if (expanded === null) {
			throw new ApiError("Failed to expand task suggestion", 400);
		}

		return expanded;
	},
});
