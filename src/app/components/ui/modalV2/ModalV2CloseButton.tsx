"use client";

import { ModalCloseButton } from "../ModalCloseButton";
import { useModalContext } from "./ModalContext";

/**
 * Props for ModalV2CloseButton component
 */
export interface ModalV2CloseButtonProps {
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
	 * If not provided, will use ModalV2's onClose from context (auto-close)
	 */
	onClose?: () => void;
}

/**
 * ModalV2CloseButton component - close button that auto-uses context's onClose
 *
 * Automatically uses the close function from ModalV2 context.
 * If onClose is provided, it will be used instead of the context's onClose.
 *
 * @example
 * ```tsx
 * <ModalV2.CloseButton />
 * ```
 */
export function ModalV2CloseButton({ onClose, ...props }: ModalV2CloseButtonProps) {
	const context = useModalContext();

	// Use provided onClose or fall back to context's onClose (auto-close)
	const handleClose = onClose || context.onClose;

	return <ModalCloseButton onClose={handleClose} {...props} />;
}
