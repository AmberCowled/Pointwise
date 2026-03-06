import { createPost } from "@pointwise/lib/api/posts";
import type { CreatePostResponse } from "@pointwise/lib/validation/posts-schema";
import { CreatePostRequestSchema } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	CreatePostResponse,
	{ userId: string; content: string }
>({
	name: "createPost",
	request: CreatePostRequestSchema,
	tags: {
		invalidates: (_result, _err, { userId }) => [{ type: "Posts", id: userId }],
	},
	protected: true,
	query: ({ userId, content }) => ({
		url: `/users/${userId}/posts`,
		method: "POST",
		body: { content },
	}),
	handler: async ({ user, body, params }) => {
		if (user.id !== params.id) {
			throw new Error(
				"Forbidden: You can only create posts on your own profile",
			);
		}
		const post = await createPost(user.id, body.content);
		return { post };
	},
});
