/**
 * Shared types for dashboard components
 */

/**
 * User profile snapshot with XP and level information
 */
export type ProfileSnapshot = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNext: number;
  xpRemaining: number;
  progress: number;
  streak?: number; // Optional until streak calculation is implemented
  title: string;
};

