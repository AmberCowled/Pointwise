"use client";

import clsx from "clsx";
import type { IconType } from "react-icons";

export interface StatIndicatorProps {
  icon: IconType;
  label: string;
  value: number | string;
  colorClass: string;
  title?: string;
}

/**
 * Stat indicator component for displaying metrics like Level and Streak
 */
export default function StatIndicator({
  icon: Icon,
  label,
  value,
  colorClass,
  title,
}: StatIndicatorProps) {
  return (
    <div
      className={clsx("flex items-center gap-1 text-xs", colorClass)}
      title={title}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-semibold uppercase tracking-[0.3em]">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
