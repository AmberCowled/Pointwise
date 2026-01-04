import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { getXP, serializeXP, updateXP } from "@pointwise/lib/api/xp";
import {
	type UpdateXPRequest,
	UpdateXPRequestSchema,
} from "@pointwise/lib/validation/xp-schema";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const prismaXP = await getXP(user.id);
		const xp = serializeXP(prismaXP);
		return jsonResponse({ xp });
	});
}

export async function PATCH(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const prismaXP = await updateXP(user.id, body as UpdateXPRequest);
			const xp = serializeXP(prismaXP);
			return jsonResponse({ xp });
		},
		UpdateXPRequestSchema,
	);
}
