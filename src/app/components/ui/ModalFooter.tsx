"use client";

import clsx from "clsx";
import type { PropsWithChildren } from "react";

/**
 * Props for ModalFooter component
 */
export interface ModalFooterProps
  extends PropsWithChildren,
    React.HTMLAttributes<HTMLElement> {
  /**
   * Alignment of footer content
   * @default 'between'
   */
  align?: "start" | "center" | "end" | "between";
  /**
   * Size variant affecting spacing
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

type Alignment = "start" | "center" | "end" | "between";

const paddingStyles: Record<NonNullable<ModalFooterProps["size"]>, string> = {
  sm: "px-4 py-3",
  md: "px-6 py-4",
  lg: "px-8 py-6",
};

const gapStyles: Record<NonNullable<ModalFooterProps["size"]>, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

/**
 * ModalFooter component for modal actions
 *
 * @example
 * ```tsx
 * <ModalFooter align="end">
 *   <Button variant="secondary" onClick={onCancel}>Cancel</Button>
 *   <Button variant="primary" onClick={onSave}>Save</Button>
 * </ModalFooter>
 * ```
 */
export function ModalFooter({
  children,
  className,
  align = "between",
  size = "md",
  ...props
}: ModalFooterProps) {
  const alignmentStyles: Record<Alignment, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  const alignmentClass = alignmentStyles[align];

  return (
    <footer
      className={clsx(
        "flex flex-wrap items-center border-t border-white/10",
        paddingStyles[size],
        gapStyles[size],
        alignmentClass,
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}
