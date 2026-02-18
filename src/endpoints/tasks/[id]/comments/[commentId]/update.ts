import { editComment } from "@pointwise/lib/api/comments";
import type { EditCommentResponse } from "@pointwise/lib/validation/comments-schema";
import { EditCommentRequestSchema } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	EditCommentResponse,
	{
		taskId: string;
		commentId: string;
		projectId: string;
		content: string;
		parentCommentId?: string;
	}
>({
	name: "editComment",
	request: EditCommentRequestSchema,
	tags: {
		invalidates: (_result, _err, { taskId, parentCommentId }) => {
			const tags: Array<
				{ type: "Comments"; id: string } | { type: "Replies"; id: string }
			> = [{ type: "Comments", id: taskId }];
			if (parentCommentId) {
				tags.push({ type: "Replies", id: parentCommentId });
			}
			return tags;
		},
	},
	protected: true,
	query: ({ taskId, commentId, projectId, content }) => ({
		url: `/tasks/${taskId}/comments/${commentId}`,
		method: "PATCH",
		body: { projectId, content },
	}),
	handler: async ({ user, body, params }) => {
		const comment = await editComment(
			params.commentId,
			params.id,
			body.projectId,
			user.id,
			body.content,
		);
		return { comment };
	},
});
