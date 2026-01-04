"use client";

import clsx from "clsx";
import type React from "react";

export type SkeletonVariant = "primary" | "secondary";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Width of the skeleton (CSS value)
	 * @default '100%'
	 */
	width?: string | number;
	/**
	 * Height of the skeleton (CSS value)
	 * @default '1rem'
	 */
	height?: string | number;
	/**
	 * Visual variant
	 * @default 'primary'
	 */
	variant?: SkeletonVariant;
	/**
	 * Whether the skeleton should be circular (for avatars, etc.)
	 * @default false
	 */
	circular?: boolean;
	/**
	 * Custom animation speed (duration in seconds)
	 * @default 1.5
	 */
	speed?: number;
}

const variantStyles: Record<SkeletonVariant, string> = {
	primary: "bg-white/10",
	secondary: "bg-white/5",
};

/**
 * Skeleton component for content placeholders during loading.
 *
 * @example
 * ```tsx
 * <Skeleton width="200px" height="20px" />
 * <Skeleton width="100%" height="40px" circular />
 * ```
 */
export function Skeleton({
	width = "100%",
	height = "1rem",
	variant = "primary",
	circular = false,
	speed = 1.5,
	className,
	style,
	...props
}: SkeletonProps) {
	const widthValue = typeof width === "number" ? `${width}px` : width;
	const heightValue = typeof height === "number" ? `${height}px` : height;

	return (
		<div
			role="status"
			aria-label="Loading"
			className={clsx(
				"animate-pulse",
				variantStyles[variant],
				circular ? "rounded-full" : "rounded",
				className,
			)}
			style={{
				width: widthValue,
				height: heightValue,
				animationDuration: `${speed}s`,
				...style,
			}}
			{...props}
		/>
	);
}
