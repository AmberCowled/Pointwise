"use client";

import clsx from "clsx";

export interface XIconProps {
  /**
   * Size of the icon
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Custom className
   */
  className?: string;
}

/**
 * XIcon component - close/cancel icon
 *
 * @example
 * ```tsx
 * <XIcon size="md" />
 * ```
 */
export function XIcon({ size = "md", className }: XIconProps) {
  const sizeStyles: Record<NonNullable<XIconProps["size"]>, string> = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  return (
    <svg
      className={clsx(sizeStyles[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
