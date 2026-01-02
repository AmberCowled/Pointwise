"use client";

import clsx from "clsx";

import { XIcon } from "../icons/XIcon";
import { useModalContext } from "./ModalContext";

/**
 * Props for ModalCloseButton component
 */
export interface ModalCloseButtonProps {
  /**
   * Custom className
   */
  className?: string;
  /**
   * Size of the button
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Visual variant of the button
   * @default 'secondary'
   */
  variant?: "primary" | "secondary" | "ghost";
  /**
   * Accessible label for the close button
   * @default 'Close'
   */
  "aria-label"?: string;
  /**
   * Callback when close button is clicked
   * If not provided, will use Modal's onClose from context (auto-close)
   */
  onClose?: () => void;
}

type CloseButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type CloseButtonVariant = "primary" | "secondary" | "ghost";

const sizeStyles: Record<CloseButtonSize, string> = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

const variantStyles: Record<CloseButtonVariant, string> = {
  primary:
    "border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-400/60",
  secondary:
    "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100",
  ghost:
    "border-transparent bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
};

/**
 * ModalCloseButton component - close button that auto-uses context's onClose
 *
 * Automatically uses the close function from Modal context.
 * If onClose is provided, it will be used instead of the context's onClose.
 *
 * @example
 * ```tsx
 * <Modal.CloseButton />
 * ```
 */
export function ModalCloseButton({
  onClose,
  className,
  size = "md",
  variant = "secondary",
  "aria-label": ariaLabel = "Close",
}: ModalCloseButtonProps) {
  const context = useModalContext();

  // Use provided onClose or fall back to context's onClose (auto-close)
  const handleClose = onClose || context.onClose;

  return (
    <button
      type="button"
      onClick={handleClose}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      aria-label={ariaLabel}
    >
      <XIcon size={size} />
    </button>
  );
}
