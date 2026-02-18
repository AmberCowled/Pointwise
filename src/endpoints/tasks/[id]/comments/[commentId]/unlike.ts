import { unlikeComment } from "@pointwise/lib/api/comments";
import type { CommentLikeResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	CommentLikeResponse,
	{
		taskId: string;
		commentId: string;
		projectId: string;
		parentCommentId?: string;
	}
>({
	name: "unlikeComment",
	protected: true,
	query: ({ taskId, commentId, projectId }) => ({
		url: `/tasks/${taskId}/comments/${commentId}/unlike?projectId=${projectId}`,
		method: "DELETE",
	}),
	optimistic: {
		updates: [
			{
				target: "getComments",
				args: (params) => ({
					taskId: params.taskId,
					projectId: params.projectId,
				}),
				update: (draft, params) => {
					const d = draft as {
						comments: Array<{
							id: string;
							likedByCurrentUser: boolean;
							likeCount: number;
						}>;
					};
					const c = d.comments.find((x) => x.id === params.commentId);
					if (c) {
						c.likedByCurrentUser = false;
						c.likeCount = Math.max(0, c.likeCount - 1);
					}
				},
			},
			{
				target: "getReplies",
				args: (params) => ({
					taskId: params.taskId,
					commentId: params.parentCommentId ?? "",
					projectId: params.projectId,
				}),
				condition: (params) => !!params.parentCommentId,
				update: (draft, params) => {
					const d = draft as {
						replies: Array<{
							id: string;
							likedByCurrentUser: boolean;
							likeCount: number;
						}>;
					};
					const r = d.replies.find((x) => x.id === params.commentId);
					if (r) {
						r.likedByCurrentUser = false;
						r.likeCount = Math.max(0, r.likeCount - 1);
					}
				},
			},
		],
	},
	handler: async ({ user, params }) => {
		await unlikeComment(params.commentId, user.id);
		return { success: true };
	},
});
