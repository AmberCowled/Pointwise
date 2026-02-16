import { isDisplayNameAvailable } from "@pointwise/lib/api/users";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	CheckDisplayNameAvailability,
	CheckDisplayNameResponse,
} from "@pointwise/lib/validation/users-schema";

export default endpoint.get<
	CheckDisplayNameResponse,
	CheckDisplayNameAvailability
>({
	name: "checkDisplayNameAvailability",
	protected: true,
	query: ({ name }) =>
		`/user/check-availability?name=${encodeURIComponent(name)}`,
	handler: async ({ user, req }) => {
		const { searchParams } = new URL(req.url);
		const name = searchParams.get("name");
		if (!name) return { available: false };
		const available = await isDisplayNameAvailable(name, user.id);
		return { available };
	},
});
