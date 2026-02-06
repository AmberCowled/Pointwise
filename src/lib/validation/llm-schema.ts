import { z } from "zod";

export const SubmitLLMRequestSchema = z.object({
	prompt: z.string().min(1, "Prompt is required").max(10000),
	feature: z.string().min(1, "Feature is required").max(60),
});

export const SubmitLLMResponseSchema = z.object({
	requestId: z.string(),
});

export const TickLLMResponseSchema = z.object({
	processed: z.boolean(),
});

export const ResultLLMResponseSchema = z.object({
	status: z.enum(["PENDING", "PROCESSING", "DONE", "FAILED"]),
	feature: z.string(),
	result: z.string().nullable().optional(),
	error: z.string().nullable().optional(),
});

export type SubmitLLMRequest = z.infer<typeof SubmitLLMRequestSchema>;
export type SubmitLLMResponse = z.infer<typeof SubmitLLMResponseSchema>;
export type TickLLMResponse = z.infer<typeof TickLLMResponseSchema>;
export type ResultLLMResponse = z.infer<typeof ResultLLMResponseSchema>;
