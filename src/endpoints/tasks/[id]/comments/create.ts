import { createComment } from "@pointwise/lib/api/comments";
import { endpoint } from "@pointwise/lib/ertk";
import type { CreateCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { CreateCommentRequestSchema } from "@pointwise/lib/validation/comments-schema";

export default endpoint.post<
	CreateCommentResponse,
	{ taskId: string; projectId: string; content: string }
>({
	name: "createComment",
	request: CreateCommentRequestSchema,
	tags: {
		invalidates: (_result, _err, { taskId }) => [
			{ type: "Comments", id: taskId },
		],
	},
	protected: true,
	query: ({ taskId, projectId, content }) => ({
		url: `/tasks/${taskId}/comments`,
		method: "POST",
		body: { projectId, content },
	}),
	optimistic: {
		target: "getTasks",
		args: (params) => ({ projectId: params.projectId }),
		update: (draft, params) => {
			const d = draft as {
				tasks: Array<{ id: string; commentCount?: number }>;
			};
			const task = d.tasks.find((t) => t.id === params.taskId);
			if (task) {
				task.commentCount = (task.commentCount ?? 0) + 1;
			}
		},
	},
	handler: async ({ user, body, params }) => {
		const comment = await createComment(
			params.id,
			body.projectId,
			user.id,
			body.content,
		);
		return { comment };
	},
});
