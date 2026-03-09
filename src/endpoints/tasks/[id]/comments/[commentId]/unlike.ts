import { unlikeComment } from "@pointwise/lib/api/comments";
import { getProjectMemberIds } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
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
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		await unlikeComment(params.commentId, user.id);

		if (!projectId) return { success: true };

		try {
			const comment = await prisma.comment.findUnique({
				where: { id: params.commentId },
				select: {
					threadId: true,
					thread: { select: { parentCommentId: true } },
				},
			});
			if (comment) {
				const memberIds = await getProjectMemberIds(projectId);
				const eventRecipients = memberIds.filter((id) => id !== user.id);
				if (eventRecipients.length > 0) {
					await emitEvent(
						"COMMENT_EDITED",
						{
							commentId: params.commentId,
							threadId: comment.threadId,
							taskId: params.id,
							parentCommentId: comment.thread.parentCommentId ?? null,
							comment: null,
						},
						eventRecipients,
					);
				}
			}
		} catch (error) {
			logDispatchError("comment unlike", error);
		}

		return { success: true };
	},
});
