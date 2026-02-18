import { deleteComment } from "@pointwise/lib/api/comments";
import type { DeleteCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	DeleteCommentResponse,
	{
		taskId: string;
		commentId: string;
		projectId: string;
		parentCommentId?: string;
		replyCount?: number;
	}
>({
	name: "deleteComment",
	tags: {
		invalidates: (_result, _err, { taskId, parentCommentId }) => {
			const tags: Array<
				{ type: "Comments"; id: string } | { type: "Replies"; id: string }
			> = [{ type: "Comments", id: taskId }];
			if (parentCommentId) {
				tags.push({ type: "Replies", id: parentCommentId });
			}
			return tags;
		},
	},
	protected: true,
	query: ({ taskId, commentId, projectId }) => ({
		url: `/tasks/${taskId}/comments/${commentId}?projectId=${projectId}`,
		method: "DELETE",
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
				const decrement = 1 + (params.replyCount ?? 0);
				task.commentCount = Math.max(0, (task.commentCount ?? 0) - decrement);
			}
		},
	},
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		await deleteComment(params.commentId, params.id, projectId ?? "", user.id);
		return { success: true };
	},
});
