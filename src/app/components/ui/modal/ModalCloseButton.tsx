"use client";

import { ModalCloseButton as BaseModalCloseButton } from "../ModalCloseButton";
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
export function ModalCloseButton({ onClose, ...props }: ModalCloseButtonProps) {
  const context = useModalContext();

  // Use provided onClose or fall back to context's onClose (auto-close)
  const handleClose = onClose || context.onClose;

  return <BaseModalCloseButton onClose={handleClose} {...props} />;
}
