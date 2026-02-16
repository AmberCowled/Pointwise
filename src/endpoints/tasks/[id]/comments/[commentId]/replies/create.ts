import { createReply } from "@pointwise/lib/api/comments";
import { endpoint } from "@pointwise/lib/ertk";
import type { CreateReplyResponse } from "@pointwise/lib/validation/comments-schema";
import { CreateCommentRequestSchema } from "@pointwise/lib/validation/comments-schema";

export default endpoint.post<
	CreateReplyResponse,
	{ taskId: string; commentId: string; projectId: string; content: string }
>({
	name: "createReply",
	request: CreateCommentRequestSchema,
	tags: {
		invalidates: (_result, _err, { taskId, commentId }) => [
			{ type: "Comments", id: taskId },
			{ type: "Replies", id: commentId },
		],
	},
	protected: true,
	query: ({ taskId, commentId, projectId, content }) => ({
		url: `/tasks/${taskId}/comments/${commentId}/replies`,
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
		const reply = await createReply(
			params.commentId,
			params.id,
			body.projectId,
			user.id,
			body.content,
		);
		return { reply };
	},
});
