import { serializeTask, updateTaskAssignments } from "@pointwise/lib/api/tasks";
import { sendNotifications } from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import type {
	UpdateTaskAssignmentsRequest,
	UpdateTaskAssignmentsResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { UpdateTaskAssignmentsRequestSchema } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	UpdateTaskAssignmentsResponse,
	{ taskId: string; data: UpdateTaskAssignmentsRequest }
>({
	name: "updateTaskAssignments",
	request: UpdateTaskAssignmentsRequestSchema,
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId, data }) => ({
		url: `/tasks/${taskId}/assign`,
		method: "PATCH",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const previousTask = await prisma.task.findUnique({
			where: { id: params.id },
			select: {
				assignedUserIds: true,
				title: true,
				project: { select: { name: true } },
			},
		});

		const prismaTask = await updateTaskAssignments(
			params.id,
			body.assignedUserIds,
			user.id,
		);
		const task = serializeTask(prismaTask);

		// Notify only newly assigned users (not the assigner themselves)
		const previousIds = new Set(previousTask?.assignedUserIds ?? []);
		const newlyAssigned = body.assignedUserIds.filter(
			(uid: string) => !previousIds.has(uid) && uid !== user.id,
		);

		if (newlyAssigned.length > 0 && previousTask) {
			try {
				await sendNotifications(newlyAssigned, "TASK_ASSIGNED", {
					projectId: body.projectId,
					projectName: previousTask.project.name,
					taskId: params.id,
					taskName: previousTask.title,
					assignedByName: (user.name as string) ?? null,
					assignedByImage: (user.image as string) ?? null,
				});
			} catch {
				// Notification failure should not break the assign action
			}
		}

		return { task };
	},
});
