import { handleProtectedRoute, jsonResponse } from "@pointwise/lib/api/route-handler";
import { getTasks, createTask, serializeTask } from "@pointwise/lib/api/tasks";
import { GetTasksRequestSchema, CreateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export async function GET(req: Request) {
  return handleProtectedRoute(req, async ({ user, query }) => {
    const tasks = await getTasks(query!.projectId, user.id);
    const serializedTasks = tasks.map(serializeTask);
    return jsonResponse({ tasks: serializedTasks });
  }, GetTasksRequestSchema);
}

export async function POST(req: Request) {
  return handleProtectedRoute(req, async ({ user, body }) => {
    const task = await createTask(body!, user.id);
    return jsonResponse({ task: serializeTask(task) }, 201);
  }, CreateTaskRequestSchema);
}