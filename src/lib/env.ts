import { z } from "zod";

const envSchema = z.object({
	// Auth
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	NEXTAUTH_SECRET: z.string().min(1),
	NEXTAUTH_URL: z.string().min(1),

	// WebAuthn
	WEBAUTHN_RP_ID: z.string().min(1),
	WEBAUTHN_RP_NAME: z.string().min(1),
	WEBAUTHN_ORIGIN: z.string().min(1),

	// Services
	ABLY_API_KEY: z.string().min(1),
	GEMINI_API_KEY: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
	EMAIL_FROM: z.string().min(1),

	// Database
	DATABASE_URL: z.string().min(1),

	// Upload
	UPLOADTHING_TOKEN: z.string().min(1),
	UPLOADTHING_APP_ID: z.string().min(1),

	// Rate Limiting
	UPSTASH_REDIS_REST_URL: z.string().min(1),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

	// Cron
	CRON_SECRET: z.string().min(1),
});

// Skip validation during CI/build — env vars aren't available in GitHub Actions
if (!process.env.CI) {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
		throw new Error(`Missing or invalid environment variables: ${missing}`);
	}
}

// Prevent the 2FA bypass flag from ever being enabled in a production runtime.
// During `next build`, NODE_ENV is "production" but the app isn't serving traffic,
// so we skip the check during CI and the Next.js build phase.
if (
	!process.env.CI &&
	process.env.NEXT_PHASE !== "phase-production-build" &&
	process.env.SKIP_2FA === "true" &&
	process.env.NODE_ENV === "production"
) {
	throw new Error("SKIP_2FA must not be enabled in production");
}
