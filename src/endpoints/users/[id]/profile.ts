import { getPublicUserProfile } from "@pointwise/lib/api/users";
import type { PublicUserProfileResponse } from "@pointwise/lib/validation/users-schema";
import { endpoint } from "ertk";

export default endpoint.get<PublicUserProfileResponse, string>({
	name: "getUserProfile",
	tags: {
		provides: (_result, _error, userId) => [
			{ type: "UserProfile", id: userId },
		],
	},
	protected: true,
	maxRetries: 2,
	query: (userId) => `/users/${userId}/profile`,
	handler: async ({ user, params }) => {
		const profile = await getPublicUserProfile(params.id, user.id);
		return profile;
	},
});
