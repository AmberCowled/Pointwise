import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { likeTask, unlikeTask } from "@pointwise/lib/api/taskLikes";
import { getTask, serializeTask } from "@pointwise/lib/api/tasks";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: taskId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!taskId) {
			return errorResponse("Task ID required", 400);
		}
		if (!projectId) {
			return errorResponse("Project ID required", 400);
		}

		await likeTask(taskId, user.id);
		const task = await getTask(taskId, projectId, user.id);
		if (!task) {
			return errorResponse("Task not found", 404);
		}
		return jsonResponse({ task: serializeTask(task, user.id) });
	});
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: taskId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!taskId) {
			return errorResponse("Task ID required", 400);
		}
		if (!projectId) {
			return errorResponse("Project ID required", 400);
		}

		await unlikeTask(taskId, user.id);
		const task = await getTask(taskId, projectId, user.id);
		if (!task) {
			return errorResponse("Task not found", 404);
		}
		return jsonResponse({ task: serializeTask(task, user.id) });
	});
}
