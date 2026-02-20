"use client";

import clsx from "clsx";

import { XIcon } from "../icons/XIcon";
import { StyleTheme } from "../StyleTheme";
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
	primary: `${StyleTheme.Status.Info.border} ${StyleTheme.Status.Info.bg} text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-400/60`,
	secondary: `${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} ${StyleTheme.Text.Secondary} hover:bg-white/10 hover:text-zinc-100`,
	ghost: `border-transparent bg-transparent ${StyleTheme.Text.Secondary} ${StyleTheme.Hover.Subtle} hover:text-zinc-100`,
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
				`inline-flex items-center justify-center rounded-lg border transition focus:outline-none ${StyleTheme.Accent.FocusRingPrimary}`,
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
