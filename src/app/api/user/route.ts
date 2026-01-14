import {
	errorResponse,
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import prisma from "@pointwise/lib/prisma";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const userData = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				profileVisibility: true,
				xp: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!userData) {
			return errorResponse("User not found", 404);
		}

		return jsonResponse(userData);
	});
}
