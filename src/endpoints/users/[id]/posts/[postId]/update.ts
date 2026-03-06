import { editPost } from "@pointwise/lib/api/posts";
import type { EditPostResponse } from "@pointwise/lib/validation/posts-schema";
import { EditPostRequestSchema } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	EditPostResponse,
	{ userId: string; postId: string; content: string }
>({
	name: "editPost",
	request: EditPostRequestSchema,
	tags: {
		invalidates: (_result, _err, { userId }) => [{ type: "Posts", id: userId }],
	},
	protected: true,
	query: ({ userId, postId, content }) => ({
		url: `/users/${userId}/posts/${postId}`,
		method: "PATCH",
		body: { content },
	}),
	handler: async ({ user, body, params }) => {
		const post = await editPost(params.postId, user.id, body.content);
		return { post };
	},
});
