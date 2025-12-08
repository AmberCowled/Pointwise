/**
 * Tests for useXpState hook
 * 
 * Tests XP state management and snapshot updates
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXpState } from './useXpState';

describe('useXpState', () => {
  const defaultOptions = {
    initialLevel: 5,
    initialTotalXp: 1000,
    initialXpIntoLevel: 100,
    initialXpToNext: 200,
    initialXpRemaining: 100,
    initialProgress: 0.5,
  };

  it('should initialize with provided values', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    expect(result.current.xpState.level).toBe(5);
    expect(result.current.xpState.totalXp).toBe(1000);
    expect(result.current.xpState.xpIntoLevel).toBe(100);
    expect(result.current.xpState.xpToNext).toBe(200);
    expect(result.current.xpState.xpRemaining).toBe(100);
    expect(result.current.xpState.progress).toBe(0.5);
  });

  it('should update XP from snapshot', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 10,
        totalXp: 5000,
        xpIntoLevel: 300,
        xpToNext: 500,
        progress: 0.6,
      });
    });

    expect(result.current.xpState.level).toBe(10);
    expect(result.current.xpState.totalXp).toBe(5000);
    expect(result.current.xpState.xpIntoLevel).toBe(300);
    expect(result.current.xpState.xpToNext).toBe(500);
    expect(result.current.xpState.xpRemaining).toBe(200); // 500 - 300
    expect(result.current.xpState.progress).toBe(0.6);
  });

  it('should calculate xpRemaining correctly', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 5,
        totalXp: 1000,
        xpIntoLevel: 50,
        xpToNext: 100,
      });
    });

    expect(result.current.xpState.xpRemaining).toBe(50); // 100 - 50
  });

  it('should handle zero xpRemaining', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 5,
        totalXp: 1000,
        xpIntoLevel: 100,
        xpToNext: 100,
      });
    });

    expect(result.current.xpState.xpRemaining).toBe(0);
  });

  it('should handle negative xpRemaining (clamp to 0)', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 5,
        totalXp: 1000,
        xpIntoLevel: 150,
        xpToNext: 100, // xpIntoLevel > xpToNext
      });
    });

    // Should clamp to 0, not negative
    expect(result.current.xpState.xpRemaining).toBe(0);
  });

  it('should handle missing optional snapshot fields', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 5,
        totalXp: 1000,
        // Missing xpIntoLevel, xpToNext, progress
      });
    });

    expect(result.current.xpState.level).toBe(5);
    expect(result.current.xpState.totalXp).toBe(1000);
    expect(result.current.xpState.xpIntoLevel).toBe(0); // Default
    expect(result.current.xpState.xpToNext).toBe(0); // Default
    expect(result.current.xpState.xpRemaining).toBe(0); // 0 - 0
    expect(result.current.xpState.progress).toBe(0); // Default
  });

  it('should allow direct state updates via setXpState', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.setXpState({
        level: 20,
        totalXp: 10000,
        xpIntoLevel: 500,
        xpToNext: 1000,
        xpRemaining: 500,
        progress: 0.5,
      });
    });

    expect(result.current.xpState.level).toBe(20);
    expect(result.current.xpState.totalXp).toBe(10000);
  });

  it('should handle multiple snapshot updates', () => {
    const { result } = renderHook(() => useXpState(defaultOptions));

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 6,
        totalXp: 1200,
        xpIntoLevel: 50,
        xpToNext: 200,
      });
    });

    expect(result.current.xpState.level).toBe(6);

    act(() => {
      result.current.updateXpFromSnapshot({
        level: 7,
        totalXp: 1500,
        xpIntoLevel: 100,
        xpToNext: 300,
      });
    });

    expect(result.current.xpState.level).toBe(7);
    expect(result.current.xpState.xpRemaining).toBe(200); // 300 - 100
  });
});

