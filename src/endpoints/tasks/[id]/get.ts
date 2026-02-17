import { getTask, serializeTask } from "@pointwise/lib/api/tasks";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	GetTaskRequest,
	GetTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { GetTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export default endpoint.get<GetTaskResponse, GetTaskRequest>({
	name: "getTask",
	request: GetTaskRequestSchema,
	tags: { provides: ["Tasks"] },
	protected: true,
	query: ({ taskId }) => `/tasks/${taskId}`,
	handler: async ({ user, params }) => {
		const task = await getTask(params.id, params.projectId, user.id);
		return { task: serializeTask(task ?? ({} as never), user.id) };
	},
});
