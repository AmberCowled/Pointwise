import { getUser } from "@pointwise/lib/api/users";
import { endpoint } from "@pointwise/lib/ertk";
import type { GetUserResponse } from "@pointwise/lib/validation/users-schema";

export default endpoint.get<GetUserResponse, void>({
	name: "getUser",
	tags: { provides: ["User"] },
	protected: true,
	query: () => "/user",
	handler: async ({ user }) => {
		const userData = await getUser(user.id);
		return { user: userData };
	},
});
