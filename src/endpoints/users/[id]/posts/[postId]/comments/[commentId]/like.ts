import { likePostComment } from "@pointwise/lib/api/post-comments";
import type { CommentLikeResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	CommentLikeResponse,
	{
		userId: string;
		postId: string;
		commentId: string;
		parentCommentId?: string;
	}
>({
	name: "likePostComment",
	protected: true,
	query: ({ userId, postId, commentId }) => ({
		url: `/users/${userId}/posts/${postId}/comments/${commentId}/like`,
		method: "POST",
	}),
	optimistic: {
		updates: [
			{
				target: "getPostComments",
				args: (params) => ({
					userId: params.userId,
					postId: params.postId,
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
				target: "getPostReplies",
				args: (params) => ({
					userId: params.userId,
					postId: params.postId,
					commentId: params.parentCommentId ?? "",
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
		await likePostComment(params.commentId, user.id);
		return { success: true };
	},
});
