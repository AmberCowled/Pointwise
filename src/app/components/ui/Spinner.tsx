"use client";

import clsx from "clsx";
import type React from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "primary" | "secondary";
export type SpinnerType = "circular" | "dots" | "bars";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Size of the spinner
	 * @default 'md'
	 */
	size?: SpinnerSize;
	/**
	 * Visual variant of the spinner
	 * @default 'primary'
	 */
	variant?: SpinnerVariant;
	/**
	 * Animation type
	 * @default 'circular'
	 */
	type?: SpinnerType;
	/**
	 * Custom animation speed (duration in seconds)
	 * @default 1
	 */
	speed?: number;
	/**
	 * Accessibility label
	 * @default 'Loading'
	 */
	"aria-label"?: string;
	/**
	 * Override the color class (e.g., 'text-white', 'bg-white')
	 * Useful for customizing spinner color in specific contexts
	 */
	colorOverride?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
	xs: "h-3 w-3",
	sm: "h-3.5 w-3.5",
	md: "h-4 w-4",
	lg: "h-5 w-5",
	xl: "h-6 w-6",
};

const variantStyles: Record<SpinnerVariant, string> = {
	primary: "text-indigo-400",
	secondary: "text-zinc-400",
};

const variantBgStyles: Record<SpinnerVariant, string> = {
	primary: "bg-indigo-400",
	secondary: "bg-zinc-400",
};

/**
 * Spinner component for indicating loading states.
 *
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 * <Spinner type="dots" size="lg" />
 * ```
 */
export function Spinner({
	size = "md",
	variant = "primary",
	type = "circular",
	speed = 1,
	"aria-label": ariaLabel = "Loading",
	colorOverride,
	className,
	...props
}: SpinnerProps) {
	const animationStyle = {
		animationDuration: `${speed}s`,
	};

	if (type === "circular") {
		return (
			<div
				aria-hidden="true"
				className={clsx("inline-block", className)}
				{...props}
			>
				<svg
					aria-hidden="true"
					className={clsx(
						sizeStyles[size],
						colorOverride || variantStyles[variant],
						"animate-spin",
					)}
					style={animationStyle}
					viewBox="0 0 24 24"
					fill="none"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
						fill="none"
					/>
					<path
						className="opacity-90"
						fill="currentColor"
						d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
					/>
				</svg>
			</div>
		);
	}

	if (type === "dots") {
		const dotSize = {
			xs: "h-1 w-1",
			sm: "h-1.5 w-1.5",
			md: "h-2 w-2",
			lg: "h-2.5 w-2.5",
			xl: "h-3 w-3",
		}[size];

		return (
			<div
				aria-hidden="true"
				className={clsx("inline-flex items-center gap-1.5", className)}
				{...props}
			>
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className={clsx(
							dotSize,
							"rounded-full",
							colorOverride || variantBgStyles[variant],
							"animate-bounce-dot",
						)}
						style={{
							animationDelay: `${i * 0.16}s`,
							animationDuration: `${speed * 1.4}s`,
						}}
					/>
				))}
			</div>
		);
	}

	if (type === "bars") {
		const barWidth = {
			xs: "w-0.5",
			sm: "w-1",
			md: "w-1.5",
			lg: "w-2",
			xl: "w-2.5",
		}[size];

		const barHeight = {
			xs: "h-3",
			sm: "h-4",
			md: "h-5",
			lg: "h-6",
			xl: "h-8",
		}[size];

		return (
			<div
				aria-hidden="true"
				className={clsx("inline-flex items-end gap-1", className)}
				{...props}
			>
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						className={clsx(
							barWidth,
							barHeight,
							"rounded-sm",
							colorOverride || variantBgStyles[variant],
							"animate-scale-bar",
						)}
						style={{
							animationDelay: `${i * 0.15}s`,
							animationDuration: `${speed * 1.2}s`,
						}}
					/>
				))}
			</div>
		);
	}

	return null;
}
