export function logServerError(
	context: string,
	error: unknown,
	meta?: Record<string, unknown>,
): void {
	const message = error instanceof Error ? error.message : String(error);
	console.warn(`[server] ${context}:`, message, meta ?? "");
}
