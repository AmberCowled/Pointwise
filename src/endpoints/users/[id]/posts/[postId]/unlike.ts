import { unlikePost } from "@pointwise/lib/api/posts";
import type { PostLikeResponse } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	PostLikeResponse,
	{ userId: string; postId: string }
>({
	name: "unlikePost",
	protected: true,
	query: ({ userId, postId }) => ({
		url: `/users/${userId}/posts/${postId}/unlike`,
		method: "DELETE",
	}),
	optimistic: {
		target: "getUserPosts",
		args: (params) => ({ userId: params.userId }),
		update: (draft, params) => {
			const d = draft as {
				posts: Array<{
					id: string;
					likedByCurrentUser?: boolean;
					likeCount?: number;
				}>;
			};
			const post = d.posts.find((p) => p.id === params.postId);
			if (post) {
				post.likedByCurrentUser = false;
				post.likeCount = Math.max(0, (post.likeCount ?? 0) - 1);
			}
		},
	},
	handler: async ({ user, params }) => {
		await unlikePost(params.postId, user.id);
		return { success: true };
	},
});
