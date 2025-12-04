/**
 * Base recurrence strategy interface
 */

import type { RecurrenceConfig, NextOccurrenceInput } from '../types';

/**
 * Base interface for recurrence strategies
 */
export interface RecurrenceStrategy {
  /**
   * Generate occurrences starting from a base date
   * @param config - Recurrence configuration
   * @param startDate - Base date to start from
   * @param timeZone - User's timezone
   * @param maxOccurrences - Maximum number of occurrences to generate
   * @returns Array of occurrence dates
   */
  generateOccurrences(
    config: RecurrenceConfig,
    startDate: Date,
    timeZone: string,
    maxOccurrences: number,
  ): Date[];

  /**
   * Find the next occurrence after a base date
   * @param input - Input parameters for finding next occurrence
   * @returns Next occurrence date, or null if not found
   */
  findNextOccurrence(input: NextOccurrenceInput): Date | null;
}
