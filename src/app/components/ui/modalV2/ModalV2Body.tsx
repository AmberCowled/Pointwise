"use client";

import clsx from "clsx";
import type { PropsWithChildren } from "react";

/**
 * Props for ModalV2Body component
 */
export interface ModalV2BodyProps
  extends PropsWithChildren,
    React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum height of the body (e.g., '400px', '50vh')
   */
  maxHeight?: string;
  /**
   * Scroll behavior
   * @default 'auto'
   */
  scrollBehavior?: "auto" | "smooth";
  /**
   * Disable scrolling
   * @default false
   */
  noScroll?: boolean;
  /**
   * Padding variant
   * @default 'md'
   */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles: Record<
  NonNullable<ModalV2BodyProps["padding"]>,
  string
> = {
  none: "p-0",
  sm: "px-4 py-4",
  md: "px-6 py-8",
  lg: "px-8 py-12",
};

/**
 * ModalV2Body component for modal content
 *
 * @example
 * ```tsx
 * <ModalV2.Body>
 *   <p>Modal content goes here</p>
 * </ModalV2.Body>
 * ```
 */
export function ModalV2Body({
  children,
  className,
  maxHeight,
  scrollBehavior = "auto",
  noScroll = false,
  padding = "md",
  style,
  ...props
}: ModalV2BodyProps) {
  return (
    <div
      className={clsx(
        "flex-1",
        paddingStyles[padding],
        !noScroll && "overflow-y-auto",
        className,
      )}
      style={{
        maxHeight,
        scrollBehavior,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
