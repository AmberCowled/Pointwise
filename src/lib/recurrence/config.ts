/**
 * Recurrence generation configuration
 */

export const RECURRENCE_CONFIG = {
	/** Default number of occurrences to generate upfront */
	defaultOccurrences: 30,
	/** Maximum iterations to prevent infinite loops */
	maxIterations: 1000,
	/** Daily recurrence specific config */
	daily: {
		/** Number of days to maintain as buffer (30 days from today) */
		bufferDays: 30,
	},
	/** Weekly recurrence specific config */
	weekly: {
		/** Maximum weeks to search when finding next occurrence */
		maxWeeksToSearch: 12,
	},
	/** Monthly recurrence specific config */
	monthly: {
		/** Maximum months to search when finding next occurrence */
		maxMonthsToSearch: 12,
	},
} as const;

/** Milliseconds per day */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days in a week */
export const DAYS_IN_WEEK = 7;
