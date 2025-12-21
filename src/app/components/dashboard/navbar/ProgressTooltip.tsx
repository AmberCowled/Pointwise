"use client";

import { useMemo } from "react";

export interface ProgressTooltipProps {
  xpIntoLevel: number;
  xpToNext: number;
  xpRemaining: number;
  nextLevel: number;
  formatter: Intl.NumberFormat;
  show: boolean;
}

/**
 * Tooltip component for progress bar showing XP details
 */
export default function ProgressTooltip({
  xpIntoLevel,
  xpToNext,
  xpRemaining,
  nextLevel,
  formatter,
  show,
}: ProgressTooltipProps) {
  const tooltipText = useMemo(
    () =>
      `${formatter.format(xpIntoLevel)} / ${formatter.format(xpToNext)} XP (${formatter.format(xpRemaining)} to Level ${nextLevel})`,
    [formatter, xpIntoLevel, xpToNext, xpRemaining, nextLevel],
  );

  if (!show) return null;

  return (
    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-900/95 px-3 py-2 text-xs text-zinc-200 shadow-xl shadow-black/40">
      <p className="whitespace-nowrap">{tooltipText}</p>
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900/95" />
    </div>
  );
}
