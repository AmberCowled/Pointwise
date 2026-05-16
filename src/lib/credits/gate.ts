import { ApiError } from "@pointwise/lib/api/errors";
import { type CreditResolution, resolveCredits } from "./resolve";

export async function gateCreditUsage(
	userId: string,
	projectId?: string | null,
): Promise<CreditResolution> {
	const resolution = await resolveCredits(userId, projectId);
	if (!resolution.canProceed) {
		throw new ApiError("Credit limit reached", 402, {
			code: "CREDIT_LIMIT_REACHED",
			denialReason: resolution.denialReason,
			creditPolicy: resolution.creditPolicy,
			source: resolution.source,
		});
	}
	return resolution;
}
