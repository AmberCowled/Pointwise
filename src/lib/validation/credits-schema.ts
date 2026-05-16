import { z } from "zod";

export const CreditBalanceResponseSchema = z.object({
	used: z.number(),
	total: z.number(),
	remaining: z.number(),
	periodEnd: z.string(),
});

export type CreditBalanceResponse = z.infer<typeof CreditBalanceResponseSchema>;

export const ProjectCreditUsageResponseSchema = z.object({
	creditPolicy: z.enum(["MEMBER_CREDITS", "OWNER_CREDITS"]),
	memberCreditCap: z.number().int().min(1).nullable(),
	ownerCredits: z.object({
		used: z.number(),
		total: z.number(),
		remaining: z.number(),
	}),
	memberUsage: z.array(
		z.object({
			userId: z.string(),
			displayName: z.string(),
			creditsUsed: z.number(),
		}),
	),
});

export type ProjectCreditUsageResponse = z.infer<
	typeof ProjectCreditUsageResponseSchema
>;
