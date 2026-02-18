import { serializeTask, updateTask } from "@pointwise/lib/api/tasks";
import type {
	UpdateTaskRequest,
	UpdateTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { UpdateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	UpdateTaskResponse,
	{ taskId: string; data: UpdateTaskRequest }
>({
	name: "updateTask",
	request: UpdateTaskRequestSchema,
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId, data }) => ({
		url: `/tasks/${taskId}`,
		method: "PATCH",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const prismaTask = await updateTask(params.id, body, user.id);
		const task = serializeTask(prismaTask);
		return { task };
	},
});
