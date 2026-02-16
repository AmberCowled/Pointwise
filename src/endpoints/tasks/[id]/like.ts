import { likeTask } from "@pointwise/lib/api/taskLikes";
import { getTask, serializeTask } from "@pointwise/lib/api/tasks";
import { endpoint } from "@pointwise/lib/ertk";
import type { UpdateTaskResponse } from "@pointwise/lib/validation/tasks-schema";

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
		return { task: serializeTask(task ?? ({} as never), user.id) };
	},
});
