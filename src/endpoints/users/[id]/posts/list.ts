import { getPosts } from "@pointwise/lib/api/posts";
import type { GetPostsResponse } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.get<GetPostsResponse, { userId: string }>({
	name: "getUserPosts",
	tags: {
		provides: (_result, _err, { userId }) => [{ type: "Posts", id: userId }],
	},
	protected: true,
	maxRetries: 2,
	query: ({ userId }) => `/users/${userId}/posts`,
	handler: async ({ user, params }) => {
		const posts = await getPosts(params.id, user.id);
		return { posts };
	},
});
