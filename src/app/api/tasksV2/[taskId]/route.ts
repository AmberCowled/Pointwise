import { handleProtectedRoute, errorResponse, jsonResponse } from "@pointwise/lib/api/route-handler";
import { updateTask, deleteTask, serializeTask } from "@pointwise/lib/api/tasks";
import { UpdateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  return handleProtectedRoute(req, async ({ user, body }) => {
    const { taskId } = await params;
    if (!taskId) {
      return errorResponse('Task ID required', 400);
    }

    const task = await updateTask(taskId, body!, user.id);
    return jsonResponse({ task: serializeTask(task) });
  }, UpdateTaskRequestSchema);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  return handleProtectedRoute(req, async ({ user }) => {
    const { taskId } = await params;
    if (!taskId) {
      return errorResponse('Task ID required', 400);
    }
    
    await deleteTask(taskId, user.id);
    return jsonResponse({ success: true });
  });
}