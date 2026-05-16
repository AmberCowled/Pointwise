import { getProjectCreditUsage } from "@pointwise/lib/credits/usage";
import type { ProjectCreditUsageResponse } from "@pointwise/lib/validation/credits-schema";
import { endpoint } from "ertk";

export default endpoint.get<ProjectCreditUsageResponse, string>({
	name: "getProjectCreditUsage",
	tags: { provides: ["CreditUsage"] },
	protected: true,
	maxRetries: 2,
	query: (projectId) => `/projects/${projectId}/credit-usage`,
	handler: async ({ user, params }) => {
		return await getProjectCreditUsage(params.id, user.id);
	},
});
