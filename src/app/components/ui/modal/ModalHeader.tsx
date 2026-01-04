"use client";

import { DialogTitle } from "@headlessui/react";
import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { useId } from "react";

import { ModalCloseButton } from "./ModalCloseButton";
import { useModalContext } from "./ModalContext";

/**
 * Props for ModalHeader component
 */
export interface ModalHeaderProps
	extends PropsWithChildren,
		Omit<React.HTMLAttributes<HTMLElement>, "title"> {
	/**
	 * Title of the modal
	 */
	title?: ReactNode;
	/**
	 * Subtitle or description below the title
	 */
	subtitle?: ReactNode;
	/**
	 * Icon to display with the title
	 */
	icon?: ReactNode;
	/**
	 * Position of the icon relative to the title
	 * @default 'left'
	 */
	iconPosition?: "left" | "right";
	/**
	 * Action buttons or elements to display on the right side
	 */
	actions?: ReactNode;
	/**
	 * Whether to show a close button
	 * @default false
	 */
	showCloseButton?: boolean;
	/**
	 * Callback when close button is clicked
	 * If not provided, will use Modal's onClose from context (auto-close)
	 */
	onClose?: () => void;
	/**
	 * Size variant affecting title and subtitle sizes
	 * @default 'md'
	 */
	size?: "sm" | "md" | "lg";
}

const titleSizeStyles: Record<NonNullable<ModalHeaderProps["size"]>, string> = {
	sm: "text-base",
	md: "text-lg",
	lg: "text-xl",
};

const subtitleSizeStyles: Record<
	NonNullable<ModalHeaderProps["size"]>,
	string
> = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

/**
 * ModalHeader component for modal titles and actions
 *
 * Automatically uses the close function from Modal context when showCloseButton is true.
 * If onClose is provided, it will be used instead of the context's onClose.
 *
 * @example
 * ```tsx
 * <Modal.Header
 *   title="Edit Task"
 *   subtitle="Make changes to your task"
 *   actions={<Button>Save</Button>}
 *   showCloseButton
 * />
 * ```
 */
export function ModalHeader({
	title,
	subtitle,
	icon,
	iconPosition = "left",
	actions,
	className,
	children,
	showCloseButton = false,
	onClose,
	size = "md",
	...props
}: ModalHeaderProps) {
	// Require ModalContext - ModalHeader must be used inside a Modal
	const context = useModalContext();
	const fallbackId = useId();
	const titleId = context.titleId || `modal-title-${fallbackId}`;

	// Use provided onClose or fall back to context's onClose (auto-close)
	const handleClose = onClose || context.onClose;

	return (
		<header
			className={clsx(
				"flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4",
				className,
			)}
			{...props}
		>
			<div className="space-y-1 flex-1">
				{title ? (
					<DialogTitle
						id={titleId}
						className={clsx(
							"font-semibold text-zinc-100",
							titleSizeStyles[size],
							icon && "flex items-center gap-2",
						)}
					>
						{icon && iconPosition === "left" && (
							<span className="shrink-0">{icon}</span>
						)}
						<span>{title}</span>
						{icon && iconPosition === "right" && (
							<span className="shrink-0">{icon}</span>
						)}
					</DialogTitle>
				) : null}
				{subtitle ? (
					<p className={clsx("text-zinc-500", subtitleSizeStyles[size])}>
						{subtitle}
					</p>
				) : null}
				{children}
			</div>
			<div className="flex items-center gap-2">
				{actions}
				{showCloseButton && handleClose && (
					<ModalCloseButton onClose={handleClose} />
				)}
			</div>
		</header>
	);
}
