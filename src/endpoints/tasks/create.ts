import { getProjectMemberIds } from "@pointwise/lib/api/projects";
import { createTask, serializeTask } from "@pointwise/lib/api/tasks";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type {
	CreateTaskRequest,
	CreateTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { CreateTaskRequestSchema } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.post<CreateTaskResponse, CreateTaskRequest>({
	name: "createTask",
	request: CreateTaskRequestSchema,
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: (task) => ({ url: "/tasks", method: "POST", body: task }),
	handler: async ({ user, body }) => {
		const prismaTask = await createTask(body, user.id);
		const task = serializeTask(prismaTask);

		const memberIds = await getProjectMemberIds(body.projectId);
		const recipients = memberIds.filter((id) => id !== user.id);

		try {
			const project = await prisma.project.findUnique({
				where: { id: body.projectId },
				select: { name: true },
			});
			if (recipients.length > 0 && project) {
				await dispatch(
					"TASK_CREATED",
					user.id,
					{
						projectId: body.projectId,
						projectName: project.name,
						taskId: prismaTask.id,
						taskName: prismaTask.title,
					},
					recipients,
				);
			}
		} catch (error) {
			logDispatchError("task created notification", error);
		}

		try {
			if (recipients.length > 0) {
				await emitEvent(
					"TASK_MUTATED",
					{ projectId: body.projectId },
					recipients,
				);
			}
		} catch (error) {
			logDispatchError("task created event", error);
		}

		return { task };
	},
});
