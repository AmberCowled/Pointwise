import { serializeXP, updateXP } from "@pointwise/lib/api/xp";
import { endpoint } from "@pointwise/lib/ertk";
import type {
	UpdateXPRequest,
	UpdateXPResponse,
} from "@pointwise/lib/validation/xp-schema";
import { UpdateXPRequestSchema } from "@pointwise/lib/validation/xp-schema";

export default endpoint.patch<UpdateXPResponse, UpdateXPRequest>({
	name: "updateXP",
	request: UpdateXPRequestSchema,
	tags: { invalidates: ["XP"] },
	protected: true,
	query: (body) => ({ url: "/user/xp", method: "PATCH", body }),
	handler: async ({ user, body }) => {
		const prismaXP = await updateXP(user.id, body);
		const xp = serializeXP(prismaXP);
		return { xp };
	},
});
