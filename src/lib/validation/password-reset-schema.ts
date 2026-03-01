import { z } from "zod";

export const ForgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
	token: z.string().min(1, "Token is required"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(128, "Password must be at most 128 characters"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
