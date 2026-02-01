import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import prisma from "@pointwise/lib/prisma";

/**
 * GET /api/notifications
 * Fetch latest notifications for the current user.
 */
export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const notifications = await prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			take: 20, // Limit to 20 latest
		});

		return jsonResponse(notifications);
	});
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read.
 */
export async function PATCH(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		await prisma.notification.updateMany({
			where: { userId: user.id, read: false },
			data: { read: true },
		});

		return jsonResponse({ success: true });
	});
}
