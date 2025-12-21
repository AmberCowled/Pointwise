"use client";

import clsx from "clsx";
import type { IconType } from "react-icons";

export type StatSize = "xs" | "sm" | "md";

/**
 * Props for the Stat component
 */
export interface StatProps {
  /**
   * Icon to display next to the label
   */
  icon: IconType;

  /**
   * Label text (e.g., "Level", "Streak")
   */
  label: string;

  /**
   * Value to display (number or string)
   */
  value: number | string;

  /**
   * Color class for the stat (e.g., "text-indigo-400", "text-rose-400")
   */
  colorClass: string;

  /**
   * Size of the stat
   * @default 'sm'
   */
  size?: StatSize;

  /**
   * Whether the stat is in a loading state
   * When true, shows a loading spinner instead of the value
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether the stat is in an error state
   * When true, shows an error indicator instead of the value
   * @default false
   */
  isError?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeStyles: Record<
  StatSize,
  { text: string; icon: string; gap: string }
> = {
  xs: {
    text: "text-[10px]",
    icon: "h-3 w-3",
    gap: "gap-0.5",
  },
  sm: {
    text: "text-xs",
    icon: "h-3.5 w-3.5",
    gap: "gap-1",
  },
  md: {
    text: "text-sm",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
};

/**
 * Stat - Reusable component for displaying metrics with icons
 *
 * **Props:**
 * - `icon: IconType` - Icon component to display
 * - `label: string` - Label text (e.g., "Level", "Streak")
 * - `value: number | string` - Value to display
 * - `colorClass: string` - Color class for styling (e.g., "text-indigo-400")
 * - `size?: "xs" | "sm" | "md"` - Size of the stat (default: "sm")
 * - `isLoading?: boolean` - Show loading spinner (default: false)
 * - `isError?: boolean` - Show error indicator (default: false)
 * - `className?: string` - Additional CSS classes
 *
 * @example
 * ```tsx
 * <Stat
 *   icon={IoStar}
 *   label="Level"
 *   value={42}
 *   colorClass="text-indigo-400"
 *   size="sm"
 * />
 * ```
 *
 * @param {StatProps} props - The props for the Stat component.
 * @returns {JSX.Element} The rendered Stat component.
 */
export function Stat({
  icon: Icon,
  label,
  value,
  colorClass,
  size = "sm",
  isLoading = false,
  isError = false,
  className,
}: StatProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={clsx(
        "flex items-center",
        styles.gap,
        styles.text,
        colorClass,
        className,
      )}
    >
      <Icon className={clsx(styles.icon, "shrink-0")} aria-hidden="true" />
      <span className="font-semibold uppercase tracking-[0.3em]">{label}:</span>
      {isLoading ? (
        <span
          className={clsx(
            "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
            styles.icon,
          )}
          aria-hidden="true"
        />
      ) : isError ? (
        <span className="font-medium">—</span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  );
}
