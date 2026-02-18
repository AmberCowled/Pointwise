import { getUser } from "@pointwise/lib/api/users";
import type { GetUserResponse } from "@pointwise/lib/validation/users-schema";
import { endpoint } from "ertk";

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
