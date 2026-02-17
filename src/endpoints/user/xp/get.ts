import { getXP, serializeXP } from "@pointwise/lib/api/xp";
import { endpoint } from "@pointwise/lib/ertk";
import type { GetXPResponse } from "@pointwise/lib/validation/xp-schema";

export default endpoint.get<GetXPResponse, void>({
	name: "getXP",
	tags: { provides: ["XP"] },
	protected: true,
	query: () => "/user/xp",
	handler: async ({ user }) => {
		const prismaXP = await getXP(user.id);
		const xp = serializeXP(prismaXP);
		return { xp };
	},
});
