import { createPostComment } from "@pointwise/lib/api/post-comments";
import type { CreateCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const RequestSchema = z.object({
	content: z.string().min(1).max(5000),
});

export default endpoint.post<
	CreateCommentResponse,
	{ userId: string; postId: string; content: string }
>({
	name: "createPostComment",
	request: RequestSchema,
	tags: {
		invalidates: (_result, _err, { postId }) => [
			{ type: "PostComments", id: postId },
		],
	},
	protected: true,
	query: ({ userId, postId, content }) => ({
		url: `/users/${userId}/posts/${postId}/comments`,
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
		const comment = await createPostComment(
			params.postId,
			user.id,
			body.content,
		);
		return { comment };
	},
});
