import { likeComment, unlikeComment } from "@pointwise/lib/api/comments";
import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string; commentId: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { commentId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!commentId) return errorResponse("Comment ID required", 400);
		if (!projectId) return errorResponse("Project ID required", 400);

		await likeComment(commentId, user.id);
		return jsonResponse({ success: true });
	});
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string; commentId: string }> },
) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { commentId } = await params;
		const projectId = new URL(req.url).searchParams.get("projectId");
		if (!commentId) return errorResponse("Comment ID required", 400);
		if (!projectId) return errorResponse("Project ID required", 400);

		await unlikeComment(commentId, user.id);
		return jsonResponse({ success: true });
	});
}
