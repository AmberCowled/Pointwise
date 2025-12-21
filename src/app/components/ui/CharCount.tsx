"use client";

import clsx from "clsx";
import type React from "react";

export type CharCountSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface CharCountProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max: number;
  size?: CharCountSize;
  warningThreshold?: number;
  errorThreshold?: number;

  /**
   * Optional callback to override the color class.
   *
   * @param normalisedUsage A number in [0, 1] representing how full the count is (0 = empty, 1 = max).
   * @returns A Tailwind class name (e.g. "text-rose-400") to use instead of the default color.
   */
  overwriteColorClass?: (normalisedUsage: number) => string;
}

const sizeStyles: Record<CharCountSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

function getCharCountColor(
  count: number,
  max: number,
  warningThreshold: number,
  errorThreshold: number,
): string {
  if (max <= 0) return "text-zinc-500";
  const percentage = (count / max) * 100;
  if (percentage >= errorThreshold) return "text-rose-400";
  if (percentage >= warningThreshold) return "text-amber-400";
  return "text-zinc-500";
}

function getNormalisedUsage(count: number, max: number): number {
  return max > 0.0 ? Math.min(1.0, Math.max(0.0, count / max)) : 0.0;
}

export function CharCount({
  count,
  max,
  size = "xs",
  warningThreshold = 70,
  errorThreshold = 90,
  overwriteColorClass,
  className,
  ...props
}: CharCountProps) {
  return (
    <span className={clsx(sizeStyles[size], className)} {...props}>
      <span
        className={
          overwriteColorClass
            ? overwriteColorClass(getNormalisedUsage(count, max))
            : getCharCountColor(count, max, warningThreshold, errorThreshold)
        }
      >
        {count}
      </span>{" "}
      <span className="text-zinc-500">/ {max}</span>
    </span>
  );
}
