import { deleteTask } from "@pointwise/lib/api/tasks";
import type { DeleteTaskResponse } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.delete<DeleteTaskResponse, { taskId: string }>({
	name: "deleteTask",
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId }) => ({ url: `/tasks/${taskId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		await deleteTask(params.id, user.id);
		return { success: true };
	},
});
