import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { getUser, updateUserProfile } from "@pointwise/lib/api/users";
import { UpdateUserProfileSchema } from "@pointwise/lib/validation/users-schema";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const userData = await getUser(user.id);
		return jsonResponse({ user: userData });
	});
}

export async function PATCH(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const updatedUser = await updateUserProfile(user.id, body);
			return jsonResponse({ user: updatedUser });
		},
		UpdateUserProfileSchema,
	);
}
