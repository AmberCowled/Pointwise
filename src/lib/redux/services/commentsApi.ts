import type {
	CommentLikeResponse,
	CreateCommentResponse,
	CreateReplyResponse,
	DeleteCommentResponse,
	EditCommentResponse,
	GetCommentsResponse,
	GetRepliesResponse,
} from "@pointwise/lib/validation/comments-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tasksApi } from "./tasksApi";

export const commentsApi = createApi({
	reducerPath: "commentsApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Comments", "Replies"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		getComments: builder.query<
			GetCommentsResponse,
			{ taskId: string; projectId: string }
		>({
			query: ({ taskId, projectId }) =>
				`/tasks/${taskId}/comments?projectId=${projectId}`,
			providesTags: (_result, _err, { taskId }) => [
				{ type: "Comments", id: taskId },
			],
		}),

		getReplies: builder.query<
			GetRepliesResponse,
			{ taskId: string; commentId: string; projectId: string }
		>({
			query: ({ taskId, commentId, projectId }) =>
				`/tasks/${taskId}/comments/${commentId}/replies?projectId=${projectId}`,
			providesTags: (_result, _err, { commentId }) => [
				{ type: "Replies", id: commentId },
			],
		}),

		createComment: builder.mutation<
			CreateCommentResponse,
			{ taskId: string; projectId: string; content: string }
		>({
			query: ({ taskId, projectId, content }) => ({
				url: `/tasks/${taskId}/comments`,
				method: "POST",
				body: { projectId, content },
			}),
			invalidatesTags: (_result, _err, { taskId }) => [
				{ type: "Comments", id: taskId },
			],
			async onQueryStarted(
				{ taskId, projectId },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically increment commentCount on the task
				const patchResult = dispatch(
					tasksApi.util.updateQueryData("getTasks", { projectId }, (draft) => {
						const task = draft.tasks.find((t) => t.id === taskId);
						if (task) {
							task.commentCount = (task.commentCount ?? 0) + 1;
						}
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		createReply: builder.mutation<
			CreateReplyResponse,
			{
				taskId: string;
				commentId: string;
				projectId: string;
				content: string;
			}
		>({
			query: ({ taskId, commentId, projectId, content }) => ({
				url: `/tasks/${taskId}/comments/${commentId}/replies`,
				method: "POST",
				body: { projectId, content },
			}),
			invalidatesTags: (_result, _err, { taskId, commentId }) => [
				{ type: "Comments", id: taskId },
				{ type: "Replies", id: commentId },
			],
			async onQueryStarted(
				{ taskId, projectId },
				{ dispatch, queryFulfilled },
			) {
				const patchResult = dispatch(
					tasksApi.util.updateQueryData("getTasks", { projectId }, (draft) => {
						const task = draft.tasks.find((t) => t.id === taskId);
						if (task) {
							task.commentCount = (task.commentCount ?? 0) + 1;
						}
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		editComment: builder.mutation<
			EditCommentResponse,
			{
				taskId: string;
				commentId: string;
				projectId: string;
				content: string;
				parentCommentId?: string;
			}
		>({
			query: ({ taskId, commentId, projectId, content }) => ({
				url: `/tasks/${taskId}/comments/${commentId}`,
				method: "PATCH",
				body: { projectId, content },
			}),
			invalidatesTags: (_result, _err, { taskId, parentCommentId }) => {
				const tags: Array<
					{ type: "Comments"; id: string } | { type: "Replies"; id: string }
				> = [{ type: "Comments", id: taskId }];
				if (parentCommentId) {
					tags.push({ type: "Replies", id: parentCommentId });
				}
				return tags;
			},
		}),

		deleteComment: builder.mutation<
			DeleteCommentResponse,
			{
				taskId: string;
				commentId: string;
				projectId: string;
				parentCommentId?: string;
				replyCount?: number;
			}
		>({
			query: ({ taskId, commentId, projectId }) => ({
				url: `/tasks/${taskId}/comments/${commentId}?projectId=${projectId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _err, { taskId, parentCommentId }) => {
				const tags: Array<
					{ type: "Comments"; id: string } | { type: "Replies"; id: string }
				> = [{ type: "Comments", id: taskId }];
				if (parentCommentId) {
					tags.push({ type: "Replies", id: parentCommentId });
				}
				return tags;
			},
			async onQueryStarted(
				{ taskId, projectId, replyCount },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically decrement commentCount
				const decrement = 1 + (replyCount ?? 0);
				const patchResult = dispatch(
					tasksApi.util.updateQueryData("getTasks", { projectId }, (draft) => {
						const task = draft.tasks.find((t) => t.id === taskId);
						if (task) {
							task.commentCount = Math.max(
								0,
								(task.commentCount ?? 0) - decrement,
							);
						}
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		likeComment: builder.mutation<
			CommentLikeResponse,
			{
				taskId: string;
				commentId: string;
				projectId: string;
				parentCommentId?: string;
			}
		>({
			query: ({ taskId, commentId, projectId }) => ({
				url: `/tasks/${taskId}/comments/${commentId}/like?projectId=${projectId}`,
				method: "POST",
			}),
			async onQueryStarted(
				{ taskId, commentId, projectId, parentCommentId },
				{ dispatch, queryFulfilled },
			) {
				const patches: Array<{ undo: () => void }> = [];

				// Optimistically update in comments list
				patches.push(
					dispatch(
						commentsApi.util.updateQueryData(
							"getComments",
							{ taskId, projectId },
							(draft) => {
								const c = draft.comments.find((x) => x.id === commentId);
								if (c) {
									c.likedByCurrentUser = true;
									c.likeCount += 1;
								}
							},
						),
					),
				);

				// Also optimistically update in replies if this is a reply
				if (parentCommentId) {
					patches.push(
						dispatch(
							commentsApi.util.updateQueryData(
								"getReplies",
								{ taskId, commentId: parentCommentId, projectId },
								(draft) => {
									const r = draft.replies.find((x) => x.id === commentId);
									if (r) {
										r.likedByCurrentUser = true;
										r.likeCount += 1;
									}
								},
							),
						),
					);
				}

				try {
					await queryFulfilled;
				} catch {
					for (const p of patches) p.undo();
				}
			},
		}),

		unlikeComment: builder.mutation<
			CommentLikeResponse,
			{
				taskId: string;
				commentId: string;
				projectId: string;
				parentCommentId?: string;
			}
		>({
			query: ({ taskId, commentId, projectId }) => ({
				url: `/tasks/${taskId}/comments/${commentId}/like?projectId=${projectId}`,
				method: "DELETE",
			}),
			async onQueryStarted(
				{ taskId, commentId, projectId, parentCommentId },
				{ dispatch, queryFulfilled },
			) {
				const patches: Array<{ undo: () => void }> = [];

				patches.push(
					dispatch(
						commentsApi.util.updateQueryData(
							"getComments",
							{ taskId, projectId },
							(draft) => {
								const c = draft.comments.find((x) => x.id === commentId);
								if (c) {
									c.likedByCurrentUser = false;
									c.likeCount = Math.max(0, c.likeCount - 1);
								}
							},
						),
					),
				);

				if (parentCommentId) {
					patches.push(
						dispatch(
							commentsApi.util.updateQueryData(
								"getReplies",
								{ taskId, commentId: parentCommentId, projectId },
								(draft) => {
									const r = draft.replies.find((x) => x.id === commentId);
									if (r) {
										r.likedByCurrentUser = false;
										r.likeCount = Math.max(0, r.likeCount - 1);
									}
								},
							),
						),
					);
				}

				try {
					await queryFulfilled;
				} catch {
					for (const p of patches) p.undo();
				}
			},
		}),
	}),
});

export const {
	useGetCommentsQuery,
	useGetRepliesQuery,
	useCreateCommentMutation,
	useCreateReplyMutation,
	useEditCommentMutation,
	useDeleteCommentMutation,
	useLikeCommentMutation,
	useUnlikeCommentMutation,
} = commentsApi;
