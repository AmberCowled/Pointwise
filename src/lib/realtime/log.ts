export function logDispatchError(
	context: string,
	error: unknown,
	meta?: Record<string, unknown>,
): void {
	const message = error instanceof Error ? error.message : String(error);
	console.warn(`[dispatch] ${context}:`, message, meta ?? "");
}
