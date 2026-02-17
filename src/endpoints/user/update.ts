import { updateUserProfile } from "@pointwise/lib/api/users";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	UpdateUserProfile,
	UpdateUserProfileResponse,
} from "@pointwise/lib/validation/users-schema";
import { UpdateUserProfileSchema } from "@pointwise/lib/validation/users-schema";

export default endpoint.patch<UpdateUserProfileResponse, UpdateUserProfile>({
	name: "updateUser",
	request: UpdateUserProfileSchema,
	tags: { invalidates: ["User"] },
	protected: true,
	query: (profileData) => ({
		url: "/user",
		method: "PATCH",
		body: profileData,
	}),
	handler: async ({ user, body }) => {
		const updatedUser = await updateUserProfile(user.id, body);
		return { user: updatedUser };
	},
});
