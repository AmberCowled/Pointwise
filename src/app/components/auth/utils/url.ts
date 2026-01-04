/**
 * Get the base URL for the application
 * Used for callback URLs in authentication flows
 */
export function getBaseUrl(): string {
	return (
		process.env.NEXTAUTH_URL ??
		(typeof window !== "undefined" ? window.location.origin : "")
	);
}
