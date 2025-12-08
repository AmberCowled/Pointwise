/**
 * Tests for XP calculation utilities
 * 
 * High priority because:
 * - Gamification core logic
 * - Level progression calculations
 * - Must be accurate for user experience
 */

import { describe, it, expect } from 'vitest';
import {
  xpToNext,
  cumulativeXpForLevel,
  levelFromXp,
  MAX_LEVEL,
  XP_CURVE,
} from './xp';

describe('xpToNext', () => {
  it('should calculate XP needed for level 1', () => {
    const result = xpToNext(1);
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(Math.floor(XP_CURVE.BASE * Math.pow(1, XP_CURVE.GROWTH)));
  });

  it('should calculate XP needed for level 2', () => {
    const result = xpToNext(2);
    expect(result).toBeGreaterThan(xpToNext(1));
  });

  it('should handle level 0 (should use level 1)', () => {
    const result = xpToNext(0);
    expect(result).toBe(xpToNext(1));
  });

  it('should handle negative levels', () => {
    const result = xpToNext(-5);
    expect(result).toBe(xpToNext(1));
  });

  it('should handle max level', () => {
    const result = xpToNext(MAX_LEVEL);
    expect(result).toBeGreaterThan(0);
  });

  it('should handle levels above max', () => {
    const result = xpToNext(MAX_LEVEL + 10);
    expect(result).toBeGreaterThan(0);
  });

  it('should return increasing XP requirements', () => {
    const level1 = xpToNext(1);
    const level2 = xpToNext(2);
    const level10 = xpToNext(10);
    const level50 = xpToNext(50);

    expect(level2).toBeGreaterThan(level1);
    expect(level10).toBeGreaterThan(level2);
    expect(level50).toBeGreaterThan(level10);
  });
});

describe('cumulativeXpForLevel', () => {
  it('should return 0 for level 1', () => {
    const result = cumulativeXpForLevel(1);
    expect(result).toBe(0);
  });

  it('should return cumulative XP for level 2', () => {
    const result = cumulativeXpForLevel(2);
    expect(result).toBe(xpToNext(1));
  });

  it('should return cumulative XP for level 3', () => {
    const result = cumulativeXpForLevel(3);
    expect(result).toBe(xpToNext(1) + xpToNext(2));
  });

  it('should handle level 0 (should clamp to 1)', () => {
    const result = cumulativeXpForLevel(0);
    expect(result).toBe(cumulativeXpForLevel(1));
  });

  it('should handle negative levels', () => {
    const result = cumulativeXpForLevel(-5);
    expect(result).toBe(cumulativeXpForLevel(1));
  });

  it('should handle max level', () => {
    const result = cumulativeXpForLevel(MAX_LEVEL);
    expect(result).toBeGreaterThan(0);
  });

  it('should handle levels above max', () => {
    const result = cumulativeXpForLevel(MAX_LEVEL + 10);
    expect(result).toBe(cumulativeXpForLevel(MAX_LEVEL + 1));
  });

  it('should return increasing cumulative XP', () => {
    const level1 = cumulativeXpForLevel(1);
    const level2 = cumulativeXpForLevel(2);
    const level10 = cumulativeXpForLevel(10);
    const level50 = cumulativeXpForLevel(50);

    expect(level2).toBeGreaterThan(level1);
    expect(level10).toBeGreaterThan(level2);
    expect(level50).toBeGreaterThan(level10);
  });
});

describe('levelFromXp', () => {
  it('should return level 1 for 0 XP', () => {
    const result = levelFromXp(0);
    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('should return level 1 for small XP amounts', () => {
    const result = levelFromXp(50);
    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(50);
    expect(result.xpToNext).toBeGreaterThan(0);
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThanOrEqual(1);
  });

  it('should calculate level correctly', () => {
    const level1Xp = xpToNext(1);
    const level2Xp = xpToNext(2);
    const totalForLevel2 = level1Xp + level2Xp;

    const result = levelFromXp(totalForLevel2);
    // totalForLevel2 is the XP needed to complete level 2, which puts us at level 3
    expect(result.level).toBe(3);
    expect(result.xpIntoLevel).toBe(0); // At level boundary
  });

  it('should handle exact level boundaries', () => {
    const level1Xp = xpToNext(1);
    const result = levelFromXp(level1Xp);

    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(0);
  });

  it('should handle negative XP', () => {
    const result = levelFromXp(-100);
    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(0);
  });

  it('should handle very large XP amounts', () => {
    const largeXp = 1000000;
    const result = levelFromXp(largeXp);

    expect(result.level).toBeGreaterThan(1);
    expect(result.level).toBeLessThanOrEqual(MAX_LEVEL);
    expect(result.xpIntoLevel).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(1);
  });

  it('should cap at max level', () => {
    const veryLargeXp = 10000000;
    const result = levelFromXp(veryLargeXp);

    expect(result.level).toBeLessThanOrEqual(MAX_LEVEL);
  });

  it('should calculate progress correctly', () => {
    const level1Xp = xpToNext(1);
    const halfwayXp = level1Xp / 2;
    const result = levelFromXp(halfwayXp);

    expect(result.level).toBe(1);
    expect(result.progress).toBeCloseTo(0.5, 1);
  });

  it('should return progress 1.0 at max level', () => {
    const maxLevelXp = cumulativeXpForLevel(MAX_LEVEL + 1);
    const result = levelFromXp(maxLevelXp);

    expect(result.level).toBe(MAX_LEVEL);
    expect(result.progress).toBe(1.0);
  });

  it('should handle fractional XP', () => {
    const result = levelFromXp(123.456);
    // XP is floored to 123, which may be level 1 or 2 depending on requirements
    expect(result.level).toBeGreaterThanOrEqual(1);
    expect(result.xpIntoLevel).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.xpIntoLevel)).toBe(true);
  });
});

describe('edge cases', () => {
  it('should handle XP curve consistency', () => {
    // Verify that cumulative XP matches sum of individual level requirements
    const level5Xp = cumulativeXpForLevel(5);
    const sum = xpToNext(1) + xpToNext(2) + xpToNext(3) + xpToNext(4);
    
    expect(level5Xp).toBe(sum);
  });

  it('should handle level progression consistency', () => {
    // If you have XP for level N, levelFromXp should return level N
    const level3Xp = cumulativeXpForLevel(3);
    const result = levelFromXp(level3Xp);
    
    expect(result.level).toBe(3);
    expect(result.xpIntoLevel).toBe(0);
  });

  it('should handle boundary between levels', () => {
    const level2Start = cumulativeXpForLevel(2);
    const level2End = cumulativeXpForLevel(3) - 1;
    
    const startResult = levelFromXp(level2Start);
    const endResult = levelFromXp(level2End);
    
    expect(startResult.level).toBe(2);
    expect(endResult.level).toBe(2);
    expect(startResult.xpIntoLevel).toBe(0);
    expect(endResult.xpIntoLevel).toBeGreaterThan(0);
  });
});

