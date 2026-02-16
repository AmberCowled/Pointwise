import { likeComment } from "@pointwise/lib/api/comments";
import { endpoint } from "@pointwise/lib/ertk";
import type { CommentLikeResponse } from "@pointwise/lib/validation/comments-schema";

export default endpoint.post<
	CommentLikeResponse,
	{
		taskId: string;
		commentId: string;
		projectId: string;
		parentCommentId?: string;
	}
>({
	name: "likeComment",
	protected: true,
	query: ({ taskId, commentId, projectId }) => ({
		url: `/tasks/${taskId}/comments/${commentId}/like?projectId=${projectId}`,
		method: "POST",
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
						c.likedByCurrentUser = true;
						c.likeCount += 1;
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
						r.likedByCurrentUser = true;
						r.likeCount += 1;
					}
				},
			},
		],
	},
	handler: async ({ user, params }) => {
		await likeComment(params.commentId, user.id);
		return { success: true };
	},
});
