import { deleteTask } from "@pointwise/lib/api/tasks";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { DeleteTaskResponse } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.delete<DeleteTaskResponse, { taskId: string }>({
	name: "deleteTask",
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId }) => ({ url: `/tasks/${taskId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const task = await prisma.task.findUnique({
			where: { id: params.id },
			select: {
				title: true,
				projectId: true,
				assignedUserIds: true,
				project: {
					select: {
						name: true,
						adminUserIds: true,
						projectUserIds: true,
						viewerUserIds: true,
					},
				},
			},
		});

		await deleteTask(params.id, user.id);

		if (task) {
			try {
				const notifRecipients = task.assignedUserIds.filter(
					(id) => id !== user.id,
				);
				if (notifRecipients.length > 0) {
					await dispatch(
						"TASK_DELETED",
						user.id,
						{
							projectId: task.projectId,
							projectName: task.project.name,
							taskName: task.title,
						},
						notifRecipients,
					);
				}
			} catch (error) {
				logDispatchError("task deleted notification", error);
			}

			try {
				const allMembers = [
					...task.project.adminUserIds,
					...task.project.projectUserIds,
					...task.project.viewerUserIds,
				];
				const eventRecipients = allMembers.filter((id) => id !== user.id);
				if (eventRecipients.length > 0) {
					await emitEvent(
						"TASK_MUTATED",
						{ projectId: task.projectId },
						eventRecipients,
					);
				}
			} catch (error) {
				logDispatchError("task deleted event", error);
			}
		}

		return { success: true };
	},
});
