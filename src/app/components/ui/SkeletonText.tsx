"use client";

import clsx from "clsx";
import type React from "react";
import { useMemo } from "react";
import { Skeleton, type SkeletonVariant } from "./Skeleton";

export interface SkeletonTextProps
	extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Number of lines to display
	 * @default 3
	 */
	lines?: number;
	/**
	 * Visual variant
	 * @default 'primary'
	 */
	variant?: SkeletonVariant;
	/**
	 * Spacing between lines (CSS value)
	 * @default '0.5rem'
	 */
	spacing?: string | number;
	/**
	 * Width of each line (CSS value or 'full' for 100%)
	 * Can be a single value or array for varying widths
	 * @default 'full'
	 */
	width?: string | number | Array<string | number>;
	/**
	 * Height of each line (CSS value)
	 * @default '1rem'
	 */
	height?: string | number;
	/**
	 * Custom animation speed (duration in seconds)
	 * @default 1.5
	 */
	speed?: number;
}

/**
 * SkeletonText component for text content placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} />
 * <SkeletonText lines={2} width={['80%', '60%']} />
 * ```
 */
export function SkeletonText({
	lines = 3,
	variant = "primary",
	spacing = "0.5rem",
	width = "full",
	height = "1rem",
	speed = 1.5,
	className,
	style,
	...props
}: SkeletonTextProps) {
	const skeletonLines = useMemo(() => {
		return Array.from({ length: lines }).map((_, index) => ({
			id: `skeleton-line-${index}`,
			width,
		}));
	}, [lines, width]);

	return (
		<div
			aria-hidden="true"
			className={clsx("flex flex-col", className)}
			style={{
				gap: typeof spacing === "number" ? `${spacing}px` : spacing,
				...style,
			}}
			{...props}
		>
			{skeletonLines.map((line) => (
				<Skeleton
					key={line.id}
					width={line.width as string | number}
					height={height}
					variant={variant}
					speed={speed}
				/>
			))}
		</div>
	);
}
