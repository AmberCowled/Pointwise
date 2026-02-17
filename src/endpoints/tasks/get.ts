import { getTasks, serializeTask } from "@pointwise/lib/api/tasks";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	GetTasksRequest,
	GetTasksResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { GetTasksRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export default endpoint.get<GetTasksResponse, GetTasksRequest>({
	name: "getTasks",
	request: GetTasksRequestSchema,
	tags: { provides: ["Tasks"] },
	protected: true,
	query: ({ projectId }) => `/tasks?projectId=${projectId}`,
	handler: async ({ user, query }) => {
		const queryData = query as unknown as GetTasksRequest;
		const tasks = await getTasks(queryData.projectId, user.id);
		const serializedTasks = tasks.map((task) => serializeTask(task, user.id));
		return { tasks: serializedTasks };
	},
});
