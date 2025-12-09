'use client';

import { useState, useCallback } from 'react';

export interface XpState {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNext: number;
  xpRemaining: number;
  progress: number;
}

export interface XpSnapshot {
  level: number;
  totalXp: number;
  xpIntoLevel?: number;
  xpToNext?: number;
  progress?: number;
}

export interface UseXpStateOptions {
  initialLevel: number;
  initialTotalXp: number;
  initialXpIntoLevel: number;
  initialXpToNext: number;
  initialXpRemaining: number;
  initialProgress: number;
}

export interface UseXpStateReturn {
  xpState: XpState;
  setXpState: (state: XpState) => void;
  updateXpFromSnapshot: (snapshot: XpSnapshot) => void;
}

/**
 * Hook for managing XP state
 * 
 * Handles:
 * - XP state initialization
 * - Updating XP from API snapshots
 * - Calculating xpRemaining from xpIntoLevel and xpToNext
 */
export function useXpState(
  options: UseXpStateOptions,
): UseXpStateReturn {
  const {
    initialLevel,
    initialTotalXp,
    initialXpIntoLevel,
    initialXpToNext,
    initialXpRemaining,
    initialProgress,
  } = options;

  const [xpState, setXpState] = useState<XpState>({
    level: initialLevel,
    totalXp: initialTotalXp,
    xpIntoLevel: initialXpIntoLevel,
    xpToNext: initialXpToNext,
    xpRemaining: initialXpRemaining,
    progress: initialProgress,
  });

  const updateXpFromSnapshot = useCallback((snapshot: XpSnapshot) => {
    const xpIntoLevel = snapshot.xpIntoLevel ?? 0;
    const xpToNext = snapshot.xpToNext ?? 0;
    
    setXpState({
      level: snapshot.level,
      totalXp: snapshot.totalXp,
      xpIntoLevel,
      xpToNext,
      xpRemaining: Math.max(0, xpToNext - xpIntoLevel),
      progress: snapshot.progress ?? 0,
    });
  }, []);

  return {
    xpState,
    setXpState,
    updateXpFromSnapshot,
  };
}

