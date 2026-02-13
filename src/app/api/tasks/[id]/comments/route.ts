import { createComment, getComments } from "@pointwise/lib/api/comments";
import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { CreateCommentRequestSchema } from "@pointwise/lib/validation/comments-schema";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: taskId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!taskId) return errorResponse("Task ID required", 400);
		if (!projectId) return errorResponse("Project ID required", 400);

		const comments = await getComments(taskId, projectId, user.id);
		return jsonResponse({ comments });
	});
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id: taskId } = await params;
			if (!taskId) return errorResponse("Task ID required", 400);

			const comment = await createComment(
				taskId,
				body.projectId,
				user.id,
				body.content,
			);
			return jsonResponse({ comment }, 201);
		},
		CreateCommentRequestSchema,
	);
}
