import { editPostComment } from "@pointwise/lib/api/post-comments";
import type { EditCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const RequestSchema = z.object({
	content: z.string().min(1).max(5000),
});

export default endpoint.patch<
	EditCommentResponse,
	{
		userId: string;
		postId: string;
		commentId: string;
		content: string;
		parentCommentId?: string;
	}
>({
	name: "editPostComment",
	request: RequestSchema,
	tags: {
		invalidates: (_result, _err, { postId, parentCommentId }) => {
			const tags: Array<
				| { type: "PostComments"; id: string }
				| { type: "PostReplies"; id: string }
			> = [{ type: "PostComments", id: postId }];
			if (parentCommentId) {
				tags.push({ type: "PostReplies", id: parentCommentId });
			}
			return tags;
		},
	},
	protected: true,
	query: ({ userId, postId, commentId, content }) => ({
		url: `/users/${userId}/posts/${postId}/comments/${commentId}`,
		method: "PATCH",
		body: { content },
	}),
	handler: async ({ user, body, params }) => {
		const comment = await editPostComment(
			params.commentId,
			params.postId,
			user.id,
			body.content,
		);
		return { comment };
	},
});
