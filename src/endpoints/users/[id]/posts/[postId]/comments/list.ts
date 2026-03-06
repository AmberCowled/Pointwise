import { getPostComments } from "@pointwise/lib/api/post-comments";
import type { GetCommentsResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	GetCommentsResponse,
	{ userId: string; postId: string }
>({
	name: "getPostComments",
	tags: {
		provides: (_result, _err, { postId }) => [
			{ type: "PostComments", id: postId },
		],
	},
	protected: true,
	maxRetries: 2,
	query: ({ userId, postId }) => `/users/${userId}/posts/${postId}/comments`,
	handler: async ({ user, params }) => {
		const comments = await getPostComments(params.postId, user.id);
		return { comments };
	},
});
