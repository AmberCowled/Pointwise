import { likePost } from "@pointwise/lib/api/posts";
import type { PostLikeResponse } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	PostLikeResponse,
	{ userId: string; postId: string }
>({
	name: "likePost",
	protected: true,
	query: ({ userId, postId }) => ({
		url: `/users/${userId}/posts/${postId}/like`,
		method: "POST",
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
				post.likedByCurrentUser = true;
				post.likeCount = (post.likeCount ?? 0) + 1;
			}
		},
	},
	handler: async ({ user, params }) => {
		await likePost(params.postId, user.id);
		return { success: true };
	},
});
