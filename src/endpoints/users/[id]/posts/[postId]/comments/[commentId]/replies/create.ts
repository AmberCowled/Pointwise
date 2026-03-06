import { createPostReply } from "@pointwise/lib/api/post-comments";
import type { CreateReplyResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const RequestSchema = z.object({
	content: z.string().min(1).max(5000),
});

export default endpoint.post<
	CreateReplyResponse,
	{ userId: string; postId: string; commentId: string; content: string }
>({
	name: "createPostReply",
	request: RequestSchema,
	tags: {
		invalidates: (_result, _err, { postId, commentId }) => [
			{ type: "PostComments", id: postId },
			{ type: "PostReplies", id: commentId },
		],
	},
	protected: true,
	query: ({ userId, postId, commentId, content }) => ({
		url: `/users/${userId}/posts/${postId}/comments/${commentId}/replies`,
		method: "POST",
		body: { content },
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
				post.commentCount = (post.commentCount ?? 0) + 1;
			}
		},
	},
	handler: async ({ user, body, params }) => {
		const reply = await createPostReply(
			params.commentId,
			params.postId,
			user.id,
			body.content,
		);
		return { reply };
	},
});
