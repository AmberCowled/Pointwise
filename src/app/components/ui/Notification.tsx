"use client";

import clsx from "clsx";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
	IoCheckmarkCircle,
	IoClose,
	IoCloseCircle,
	IoInformationCircle,
	IoWarning,
} from "react-icons/io5";
import { StyleTheme } from "./StyleTheme";

export type NotificationVariant = "success" | "error" | "warning" | "info";
export type NotificationSize = "xs" | "sm" | "md" | "lg" | "xl";
export type NotificationPosition =
	| "top-left"
	| "top-right"
	| "top-center"
	| "bottom-left"
	| "bottom-right"
	| "bottom-center";

export interface NotificationProps {
	/**
	 * Unique identifier for the notification
	 */
	id: string;
	/**
	 * The message to display
	 */
	message: string;
	/**
	 * Optional title for the notification
	 */
	title?: string;
	/**
	 * Variant style of the notification
	 * @default 'info'
	 */
	variant?: NotificationVariant;
	/**
	 * Size of the notification
	 * @default 'md'
	 */
	size?: NotificationSize;
	/**
	 * Duration in milliseconds before auto-dismissing. Set to 0 or undefined to disable auto-dismiss
	 * @default 5000
	 */
	duration?: number;
	/**
	 * Whether the notification can be manually dismissed
	 * @default true
	 */
	dismissible?: boolean;
	/**
	 * Optional icon to display (overrides default variant icon)
	 */
	icon?: React.ReactNode;
	/**
	 * Optional action button
	 */
	action?: {
		label: string;
		onClick: () => void;
	};
	/**
	 * Callback when notification is dismissed
	 */
	onDismiss?: () => void;
	/**
	 * Custom className
	 */
	className?: string;
}

const baseStyle =
	"relative flex items-center gap-3 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out";

const variantStyles: Record<NotificationVariant, string> = {
	success: `${StyleTheme.Status.Success.border} ${StyleTheme.Status.Success.bg} ${StyleTheme.Status.Success.textContent} ${StyleTheme.Status.Success.shadow}`,
	error: `${StyleTheme.Status.Error.border} ${StyleTheme.Status.Error.bg} ${StyleTheme.Status.Error.textContent} ${StyleTheme.Status.Error.shadow}`,
	warning: `${StyleTheme.Status.Warning.border} ${StyleTheme.Status.Warning.bg} ${StyleTheme.Status.Warning.textContent} ${StyleTheme.Status.Warning.shadow}`,
	info: `${StyleTheme.Status.Info.border} ${StyleTheme.Status.Info.bg} ${StyleTheme.Status.Info.textContent} ${StyleTheme.Status.Info.shadow}`,
};

const sizeStyles: Record<NotificationSize, string> = {
	xs: "text-xs px-3 py-2",
	sm: "text-sm px-3 py-2.5",
	md: "text-sm px-4 py-3",
	lg: "text-base px-5 py-4",
	xl: "text-lg px-6 py-5",
};

const iconSizeStyles: Record<NotificationSize, string> = {
	xs: "h-3.5 w-3.5",
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-6 w-6",
	xl: "h-7 w-7",
};

const defaultIcons: Record<NotificationVariant, React.ReactNode> = {
	success: <IoCheckmarkCircle />,
	error: <IoCloseCircle />,
	warning: <IoWarning />,
	info: <IoInformationCircle />,
};

/**
 * Notification component for displaying toast-style messages to users.
 *
 * @example
 * ```tsx
 * <Notification
 *   id="1"
 *   message="Task created successfully!"
 *   variant="success"
 *   onDismiss={() => console.log('dismissed')}
 * />
 * ```
 */
export function Notification({
	message,
	title,
	variant = "info",
	size = "md",
	duration = 5000,
	dismissible = true,
	icon,
	action,
	onDismiss,
	className,
}: NotificationProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [isExiting, setIsExiting] = useState(false);

	const handleDismiss = useCallback(() => {
		setIsExiting(true);
		// Wait for animation to complete before calling onDismiss
		setTimeout(() => {
			setIsVisible(false);
			onDismiss?.();
		}, 300); // Match transition duration
	}, [onDismiss]);

	useEffect(() => {
		if (duration && duration > 0) {
			const timer = setTimeout(() => {
				handleDismiss();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration, handleDismiss]);

	if (!isVisible) {
		return null;
	}

	const displayIcon = icon ?? defaultIcons[variant];

	return (
		<div
			role="alert"
			aria-live="polite"
			aria-atomic="true"
			className={clsx(
				baseStyle,
				variantStyles[variant],
				sizeStyles[size],
				isExiting && "opacity-0 translate-x-full",
				!isExiting && "opacity-100 translate-x-0",
				className,
			)}
		>
			{displayIcon && (
				<div
					className={clsx("shrink-0 flex items-center", iconSizeStyles[size])}
				>
					{displayIcon}
				</div>
			)}

			<div className="flex-1 min-w-0 flex items-center">
				<div>
					{title && (
						<div className="font-semibold mb-1 text-current">{title}</div>
					)}
					<div className="text-current">{message}</div>
					{action && (
						<button
							type="button"
							onClick={action.onClick}
							className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded"
						>
							{action.label}
						</button>
					)}
				</div>
			</div>

			{dismissible && (
				<button
					type="button"
					onClick={handleDismiss}
					className="shrink-0 rounded-lg p-1 text-current/60 hover:text-current hover:bg-current/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent transition flex items-center justify-center"
					aria-label="Dismiss notification"
				>
					<IoClose className={iconSizeStyles[size]} />
				</button>
			)}
		</div>
	);
}
