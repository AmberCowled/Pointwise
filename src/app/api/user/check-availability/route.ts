import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { isDisplayNameAvailable } from "@pointwise/lib/api/users";
import { CheckDisplayNameAvailabilitySchema } from "@pointwise/lib/validation/users-schema";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const { searchParams } = new URL(req.url);
		const name = searchParams.get("name");

		const result = CheckDisplayNameAvailabilitySchema.safeParse({ name });

		if (!result.success) {
			return jsonResponse({ available: false, error: "Invalid name" }, 400);
		}

		const available = await isDisplayNameAvailable(result.data.name, user.id);

		return jsonResponse({ available });
	});
}
