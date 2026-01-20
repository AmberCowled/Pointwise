import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { getUser, updateUserProfile } from "@pointwise/lib/api/users";
import type {
	UpdateUserProfile,
	UpdateUserProfileResponse,
} from "@pointwise/lib/validation/users-schema";
import { UpdateUserProfileSchema } from "@pointwise/lib/validation/users-schema";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const userData = await getUser(user.id);
		return jsonResponse({ user: userData });
	});
}

export async function PATCH(req: Request) {
	return handleProtectedRoute<
		UpdateUserProfile,
		UpdateUserProfileResponse | { error: string }
	>(
		req,
		async ({ user, body }) => {
			try {
				const updatedUser = await updateUserProfile(user.id, body);
				return jsonResponse({ user: updatedUser });
			} catch (error) {
				if (error instanceof Error && error.message === "DISPLAY_NAME_TAKEN") {
					return jsonResponse({ error: "Display name is already taken" }, 409);
				}
				throw error;
			}
		},
		UpdateUserProfileSchema,
	);
}
