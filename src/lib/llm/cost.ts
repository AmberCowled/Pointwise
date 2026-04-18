const PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
	"gemini-3-flash-preview": { inputPer1M: 0.5, outputPer1M: 3.0 },
	"gemini-2.5-flash": { inputPer1M: 0.3, outputPer1M: 2.5 },
};

const DEFAULT_MODEL = "gemini-3-flash-preview";

export function calculateCostUsd(
	model: string,
	inputTokens: number,
	outputTokens: number,
): number {
	const p = PRICING[model] ?? PRICING[DEFAULT_MODEL];
	return (
		(inputTokens * p.inputPer1M + outputTokens * p.outputPer1M) / 1_000_000
	);
}
