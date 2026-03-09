import { getProjectMemberIds } from "@pointwise/lib/api/projects";
import { likeTask } from "@pointwise/lib/api/taskLikes";
import { getTask, serializeTask } from "@pointwise/lib/api/tasks";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { UpdateTaskResponse } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	UpdateTaskResponse,
	{ taskId: string; projectId: string }
>({
	name: "likeTask",
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId, projectId }) => ({
		url: `/tasks/${taskId}/like?projectId=${projectId}`,
		method: "POST",
	}),
	optimistic: {
		target: "getTasks",
		args: (params) => ({ projectId: params.projectId }),
		update: (draft, params) => {
			const d = draft as {
				tasks: Array<{
					id: string;
					likedByCurrentUser?: boolean;
					likeCount?: number;
				}>;
			};
			const task = d.tasks.find((t) => t.id === params.taskId);
			if (task) {
				task.likedByCurrentUser = true;
				task.likeCount = (task.likeCount ?? 0) + 1;
			}
		},
	},
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		await likeTask(params.id, user.id);
		const task = await getTask(params.id, projectId ?? "", user.id);
		const serialized = serializeTask(task ?? ({} as never), user.id);

		if (task && projectId) {
			try {
				const notifRecipients = task.assignedUserIds.filter(
					(id) => id !== user.id,
				);
				if (notifRecipients.length > 0) {
					const project = await prisma.project.findUnique({
						where: { id: projectId },
						select: { name: true },
					});
					if (project) {
						await dispatch(
							"TASK_LIKED",
							user.id,
							{
								projectId,
								projectName: project.name,
								taskId: params.id,
								taskName: task.title,
							},
							notifRecipients,
						);
					}
				}
			} catch (error) {
				logDispatchError("task liked notification", error);
			}

			try {
				const memberIds = await getProjectMemberIds(projectId);
				const eventRecipients = memberIds.filter((id) => id !== user.id);
				if (eventRecipients.length > 0) {
					await emitEvent("TASK_MUTATED", { projectId }, eventRecipients);
				}
			} catch (error) {
				logDispatchError("task liked event", error);
			}
		}

		return { task: serialized };
	},
});
