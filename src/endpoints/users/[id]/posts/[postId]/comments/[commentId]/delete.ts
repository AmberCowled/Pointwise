import { deletePostComment } from "@pointwise/lib/api/post-comments";
import type { DeleteCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	DeleteCommentResponse,
	{
		userId: string;
		postId: string;
		commentId: string;
		parentCommentId?: string;
		replyCount?: number;
	}
>({
	name: "deletePostComment",
	tags: {
		invalidates: (_result, _err, { postId, parentCommentId }) => {
			const tags: Array<
				| { type: "PostComments"; id: string }
				| { type: "PostReplies"; id: string }
			> = [{ type: "PostComments", id: postId }];
			if (parentCommentId) {
				tags.push({ type: "PostReplies", id: parentCommentId });
			}
			return tags;
		},
	},
	protected: true,
	query: ({ userId, postId, commentId }) => ({
		url: `/users/${userId}/posts/${postId}/comments/${commentId}`,
		method: "DELETE",
	}),
	optimistic: {
		target: "getUserPosts",
		args: (params) => ({ userId: params.userId }),
		update: (draft, params) => {
			const d = draft as {
				posts: Array<{ id: string; commentCount?: number }>;
			};
			const post = d.posts.find((p) => p.id === params.postId);
			if (post) {
				const decrement = 1 + (params.replyCount ?? 0);
				post.commentCount = Math.max(0, (post.commentCount ?? 0) - decrement);
			}
		},
	},
	handler: async ({ user, params }) => {
		await deletePostComment(params.commentId, params.postId, user.id);
		return { success: true };
	},
});
