import { getComments } from "@pointwise/lib/api/comments";
import { endpoint } from "@pointwise/lib/ertk";
import type { GetCommentsResponse } from "@pointwise/lib/validation/comments-schema";

export default endpoint.get<
	GetCommentsResponse,
	{ taskId: string; projectId: string }
>({
	name: "getComments",
	tags: {
		provides: (_result, _err, { taskId }) => [{ type: "Comments", id: taskId }],
	},
	protected: true,
	query: ({ taskId, projectId }) =>
		`/tasks/${taskId}/comments?projectId=${projectId}`,
	handler: async ({ user, params, req }) => {
		const projectId = new URL(req.url).searchParams.get("projectId");
		const comments = await getComments(params.id, projectId ?? "", user.id);
		return { comments };
	},
});
