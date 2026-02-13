import { deleteComment, editComment } from "@pointwise/lib/api/comments";
import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { EditCommentRequestSchema } from "@pointwise/lib/validation/comments-schema";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string; commentId: string }> },
) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const { id: taskId, commentId } = await params;
			if (!taskId) return errorResponse("Task ID required", 400);
			if (!commentId) return errorResponse("Comment ID required", 400);

			const comment = await editComment(
				commentId,
				taskId,
				body.projectId,
				user.id,
				body.content,
			);
			return jsonResponse({ comment });
		},
		EditCommentRequestSchema,
	);
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string; commentId: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { id: taskId, commentId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!taskId) return errorResponse("Task ID required", 400);
		if (!commentId) return errorResponse("Comment ID required", 400);
		if (!projectId) return errorResponse("Project ID required", 400);

		await deleteComment(commentId, taskId, projectId, user.id);
		return jsonResponse({ success: true });
	});
}
