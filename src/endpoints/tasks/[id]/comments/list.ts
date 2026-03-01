import { getComments } from "@pointwise/lib/api/comments";
import type { GetCommentsResponse } from "@pointwise/lib/validation/comments-schema";
import { endpoint } from "ertk";

export default endpoint.get<
	GetCommentsResponse,
	{ taskId: string; projectId: string }
>({
	name: "getComments",
	tags: {
		provides: (_result, _err, { taskId }) => [{ type: "Comments", id: taskId }],
	},
	protected: true,
	maxRetries: 2,
	query: ({ taskId, projectId }) =>
		`/tasks/${taskId}/comments?projectId=${projectId}`,
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		const comments = await getComments(params.id, projectId ?? "", user.id);
		return { comments };
	},
});
