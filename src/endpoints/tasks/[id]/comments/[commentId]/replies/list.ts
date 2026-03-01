import { getReplies } from "@pointwise/lib/api/comments";
import type { GetRepliesResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	GetRepliesResponse,
	{ taskId: string; commentId: string; projectId: string }
>({
	name: "getReplies",
	tags: {
		provides: (_result, _err, { commentId }) => [
			{ type: "Replies", id: commentId },
		],
	},
	protected: true,
	maxRetries: 2,
	query: ({ taskId, commentId, projectId }) =>
		`/tasks/${taskId}/comments/${commentId}/replies?projectId=${projectId}`,
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		const replies = await getReplies(
			params.commentId,
			params.id,
			projectId ?? "",
			user.id,
		);
		return { replies };
	},
});
