/**
 * Validation functions for XP-related endpoints
 */

type ValidationError = {
	success: false;
	status: number;
	error: string;
};

type ValidationSuccess<T> = {
	success: true;
	data: T;
};

export type NormalizedXpAward = {
	delta: number;
};

const MIN_XP_DELTA = 1;
const MAX_XP_DELTA = 1_000_000;

/**
 * Validate XP award request body
 */
export function parseXpAwardBody(
	input: unknown,
): ValidationSuccess<NormalizedXpAward> | ValidationError {
	if (typeof input !== "object" || input === null) {
		return invalid("Invalid JSON payload.");
	}

	const body = input as Record<string, unknown>;

	const delta = sanitizeXpDelta(body.delta);
	if (delta < MIN_XP_DELTA) {
		return invalid(`XP delta must be at least ${MIN_XP_DELTA}.`);
	}
	if (delta > MAX_XP_DELTA) {
		return invalid(`XP delta must be at most ${MAX_XP_DELTA}.`);
	}

	return {
		success: true,
		data: {
			delta,
		},
	};
}

function sanitizeXpDelta(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return 0;
	}
	return Math.max(0, Math.floor(value));
}

function invalid(error: string, status = 400): ValidationError {
	return { success: false, error, status };
}
