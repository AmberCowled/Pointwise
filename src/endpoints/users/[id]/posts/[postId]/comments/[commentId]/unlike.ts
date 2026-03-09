import {
	resolvePostCommentRecipients,
	unlikePostComment,
} from "@pointwise/lib/api/post-comments";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
import type { CommentLikeResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	CommentLikeResponse,
	{
		userId: string;
		postId: string;
		commentId: string;
		parentCommentId?: string;
	}
>({
	name: "unlikePostComment",
	protected: true,
	query: ({ userId, postId, commentId }) => ({
		url: `/users/${userId}/posts/${postId}/comments/${commentId}/unlike`,
		method: "DELETE",
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
						c.likedByCurrentUser = false;
						c.likeCount = Math.max(0, c.likeCount - 1);
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
						r.likedByCurrentUser = false;
						r.likeCount = Math.max(0, r.likeCount - 1);
					}
				},
			},
		],
	},
	handler: async ({ user, params }) => {
		await unlikePostComment(params.commentId, user.id);

		try {
			const comment = await prisma.comment.findUnique({
				where: { id: params.commentId },
				select: {
					threadId: true,
					thread: { select: { parentCommentId: true } },
				},
			});
			if (comment) {
				const recipients = await resolvePostCommentRecipients(params.postId);
				const eventRecipients = recipients.filter((id) => id !== user.id);
				if (eventRecipients.length > 0) {
					await emitEvent(
						"COMMENT_EDITED",
						{
							commentId: params.commentId,
							threadId: comment.threadId,
							postId: params.postId,
							parentCommentId: comment.thread.parentCommentId ?? null,
							comment: null,
						},
						eventRecipients,
					);
				}
			}
		} catch (error) {
			logDispatchError("post comment unlike", error);
		}

		return { success: true };
	},
});
