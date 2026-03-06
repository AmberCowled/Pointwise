import { getPostReplies } from "@pointwise/lib/api/post-comments";
import type { GetRepliesResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	GetRepliesResponse,
	{ userId: string; postId: string; commentId: string }
>({
	name: "getPostReplies",
	tags: {
		provides: (_result, _err, { commentId }) => [
			{ type: "PostReplies", id: commentId },
		],
	},
	protected: true,
	maxRetries: 2,
	query: ({ userId, postId, commentId }) =>
		`/users/${userId}/posts/${postId}/comments/${commentId}/replies`,
	handler: async ({ user, params }) => {
		const replies = await getPostReplies(
			params.commentId,
			params.postId,
			user.id,
		);
		return { replies };
	},
});
