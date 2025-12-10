import { handleProtectedRoute, jsonResponse } from "@pointwise/lib/api/route-handler";
import { getXP, updateXP, serializeXP } from "@pointwise/lib/xp";
import { UpdateXPRequestSchema } from "@pointwise/lib/validation/xp-schema";

export async function GET(req: Request) {
    return handleProtectedRoute(req, async ({ user }) => {
        const xp = await getXP(user.id);
        const serializedXP = serializeXP(xp);
        return jsonResponse({ xp: serializedXP });
    });
}

export async function PATCH(req: Request) {
    return handleProtectedRoute(req, async ({ user, body }) => {
        const xp = await updateXP(user.id, body!.delta);
        const serializedXP = serializeXP(xp);
        return jsonResponse({ xp: serializedXP });
    }, UpdateXPRequestSchema);
}
