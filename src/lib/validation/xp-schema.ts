/**
 * Zod schemas for XP-related endpoints
 */

import { z } from 'zod';

const MIN_XP_DELTA = 1;
const MAX_XP_DELTA = 1_000_000;

const XP_DELTA_SCHEMA = z.number()
  .int('XP delta must be an integer')
  .min(MIN_XP_DELTA, `XP delta must be at least ${MIN_XP_DELTA}`)
  .max(MAX_XP_DELTA, `XP delta must be at most ${MAX_XP_DELTA}`);

/**
 * Schema for XP update request
 */
export const UpdateXPRequestSchema = z.object({
  delta: XP_DELTA_SCHEMA,
});

export type UpdateXPRequest = z.infer<typeof UpdateXPRequestSchema>;
