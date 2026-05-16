import { ApiError } from "@pointwise/lib/api/errors";
import { getTaskBreakdown } from "@pointwise/lib/api/task-generation";
import type { TaskBreakdownResponse } from "@pointwise/lib/validation/task-generation-schema";
import {
	type TaskBreakdownRequest,
	TaskBreakdownRequestSchema,
} from "@pointwise/lib/validation/task-generation-schema";
import { endpoint } from "ertk";

export default endpoint.post<TaskBreakdownResponse, TaskBreakdownRequest>({
	name: "getTaskBreakdown",
	request: TaskBreakdownRequestSchema,
	protected: true,
	query: (body) => ({ url: "/llm/task-breakdown", method: "POST", body }),
	handler: async ({ body, user }) => {
		const subtasks = await getTaskBreakdown(
			body.goal ?? null,
			body.title.trim(),
			body.description?.trim() ?? null,
			user.id,
			body.projectId,
		);

		if (subtasks === null) {
			throw new ApiError("Failed to break down task", 400);
		}

		return { subtasks };
	},
});
