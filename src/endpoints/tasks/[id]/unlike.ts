import { unlikeTask } from "@pointwise/lib/api/taskLikes";
import { getTask, serializeTask } from "@pointwise/lib/api/tasks";
import type { UpdateTaskResponse } from "@pointwise/lib/validation/tasks-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	UpdateTaskResponse,
	{ taskId: string; projectId: string }
>({
	name: "unlikeTask",
	tags: { invalidates: ["Tasks"] },
	protected: true,
	query: ({ taskId, projectId }) => ({
		url: `/tasks/${taskId}/unlike?projectId=${projectId}`,
		method: "DELETE",
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
				task.likedByCurrentUser = false;
				task.likeCount = Math.max(0, (task.likeCount ?? 0) - 1);
			}
		},
	},
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		await unlikeTask(params.id, user.id);
		const task = await getTask(params.id, projectId ?? "", user.id);
		return { task: serializeTask(task ?? ({} as never), user.id) };
	},
});
