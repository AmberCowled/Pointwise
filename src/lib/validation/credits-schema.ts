import { z } from "zod";

export const CreditBalanceResponseSchema = z.object({
	used: z.number(),
	total: z.number(),
	remaining: z.number(),
	periodEnd: z.string(),
});

export type CreditBalanceResponse = z.infer<typeof CreditBalanceResponseSchema>;
