/**
 * Shared types for dashboard components
 */

/**
 * User profile snapshot with XP and level information
 * Note: XP fields are deprecated - use Redux state instead
 */
export type ProfileSnapshot = {
  level?: number; // Deprecated: Use Redux
  totalXp?: number; // Deprecated: Use Redux
  xpIntoLevel?: number; // Deprecated: Use Redux
  xpToNext?: number; // Deprecated: Use Redux
  xpRemaining?: number; // Deprecated: Use Redux
  progress?: number; // Deprecated: Use Redux
  streak?: number; // Optional until streak calculation is implemented
  title: string;
};
