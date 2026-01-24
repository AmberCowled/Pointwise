import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import {
	deleteTask,
	serializeTask,
	updateTask,
} from "@pointwise/lib/api/tasks";
import { UpdateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id: taskId } = await params;
			if (!taskId) {
				return errorResponse("Task ID required", 400);
			}

			const prismaTask = await updateTask(taskId, body, user.id);
			const task = serializeTask(prismaTask);
			return jsonResponse({ task });
		},
		UpdateTaskRequestSchema,
	);
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: taskId } = await params;
		if (!taskId) {
			return errorResponse("Task ID required", 400);
		}

		await deleteTask(taskId, user.id);
		return jsonResponse({ success: true });
	});
}
