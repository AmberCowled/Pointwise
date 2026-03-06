import { deletePost } from "@pointwise/lib/api/posts";
import type { DeletePostResponse } from "@pointwise/lib/validation/posts-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	DeletePostResponse,
	{ userId: string; postId: string }
>({
	name: "deletePost",
	tags: {
		invalidates: (_result, _err, { userId }) => [{ type: "Posts", id: userId }],
	},
	protected: true,
	query: ({ userId, postId }) => ({
		url: `/users/${userId}/posts/${postId}`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		await deletePost(params.postId, user.id);
		return { success: true };
	},
});
