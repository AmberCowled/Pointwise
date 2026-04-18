import { getRemainingCredits } from "@pointwise/lib/credits/balance";
import type { CreditBalanceResponse } from "@pointwise/lib/validation/credits-schema";
import { endpoint } from "ertk";

export default endpoint.get<CreditBalanceResponse, void>({
	name: "getCreditBalance",
	tags: { provides: ["CreditBalance"] },
	protected: true,
	maxRetries: 2,
	query: () => "/credits/balance",
	handler: async ({ user }) => {
		const balance = await getRemainingCredits(user.id);
		return {
			...balance,
			periodEnd: balance.periodEnd.toISOString(),
		};
	},
});
