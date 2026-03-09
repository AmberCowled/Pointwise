import { getProjectMemberIds } from "@pointwise/lib/api/projects";
import { serializeTask, updateTask } from "@pointwise/lib/api/tasks";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
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

		try {
			const memberIds = await getProjectMemberIds(body.projectId);
			const recipients = memberIds.filter((id) => id !== user.id);
			if (recipients.length > 0) {
				await emitEvent(
					"TASK_MUTATED",
					{ projectId: body.projectId },
					recipients,
				);
			}
		} catch (error) {
			logDispatchError("task updated event", error);
		}

		return { task };
	},
});
