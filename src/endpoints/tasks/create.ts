import { createTask, serializeTask } from "@pointwise/lib/api/tasks";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	CreateTaskRequest,
	CreateTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { CreateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export default endpoint.post<CreateTaskResponse, CreateTaskRequest>({
	name: "createTask",
	request: CreateTaskRequestSchema,
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: (task) => ({ url: "/tasks", method: "POST", body: task }),
	handler: async ({ user, body }) => {
		const prismaTask = await createTask(body, user.id);
		const task = serializeTask(prismaTask);
		return { task };
	},
});
