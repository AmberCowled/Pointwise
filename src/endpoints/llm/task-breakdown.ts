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
	handler: async ({ body }) => {
		const subtasks = await getTaskBreakdown(
			body.goal ?? null,
			body.title.trim(),
			body.description?.trim() ?? null,
		);

		if (subtasks === null) {
			const err = new Error("Failed to break down task");
			(err as Error & { status: number }).status = 400;
			throw err;
		}

		return { subtasks };
	},
});
