import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { createTask, getTasks, serializeTask } from "@pointwise/lib/api/tasks";
import {
	CreateTaskRequestSchema,
	GetTasksRequestSchema,
} from "@pointwise/lib/validation/tasks-schema";
import type { z } from "zod";

type GetTasksQuery = z.infer<typeof GetTasksRequestSchema>;

export async function GET(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, query }) => {
			// query is guaranteed to be present when schema is provided (GetTasksRequestSchema)
			// Type assertion needed due to TypeScript overload resolution limitations
			const queryData = query as unknown as GetTasksQuery;
			const tasks = await getTasks(queryData.projectId, user.id);
			const serializedTasks = tasks.map(serializeTask);
			return jsonResponse({ tasks: serializedTasks });
		},
		GetTasksRequestSchema,
	);
}

export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const prismaTask = await createTask(body, user.id);
			const task = serializeTask(prismaTask);
			return jsonResponse({ task }, 201);
		},
		CreateTaskRequestSchema,
	);
}
