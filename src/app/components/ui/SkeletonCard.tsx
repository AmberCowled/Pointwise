"use client";

import clsx from "clsx";
import type React from "react";
import { Skeleton, type SkeletonVariant } from "./Skeleton";
import { SkeletonText } from "./SkeletonText";
import { StyleTheme } from "./StyleTheme";

export interface SkeletonCardProps
	extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Visual variant
	 * @default 'primary'
	 */
	variant?: SkeletonVariant;
	/**
	 * Whether to show a header section
	 * @default true
	 */
	showHeader?: boolean;
	/**
	 * Whether to show an image/avatar section
	 * @default false
	 */
	showImage?: boolean;
	/**
	 * Number of text lines in the body
	 * @default 3
	 */
	lines?: number;
	/**
	 * Whether to show a footer section
	 * @default false
	 */
	showFooter?: boolean;
	/**
	 * Custom animation speed (duration in seconds)
	 * @default 1.5
	 */
	speed?: number;
}

/**
 * SkeletonCard component for card content placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * <SkeletonCard showImage showFooter lines={4} />
 * ```
 */
export function SkeletonCard({
	variant = "primary",
	showHeader = true,
	showImage = false,
	lines = 3,
	showFooter = false,
	speed = 1.5,
	className,
	...props
}: SkeletonCardProps) {
	return (
		<div
			aria-hidden="true"
			className={clsx(
				`rounded-2xl border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} p-4 space-y-4`,
				className,
			)}
			{...props}
		>
			{showHeader && (
				<div className="flex items-center gap-3">
					{showImage && (
						<Skeleton
							width="48px"
							height="48px"
							circular
							variant={variant}
							speed={speed}
						/>
					)}
					<div className="flex-1 space-y-2">
						<Skeleton
							width="60%"
							height="1rem"
							variant={variant}
							speed={speed}
						/>
						<Skeleton
							width="40%"
							height="0.75rem"
							variant={variant}
							speed={speed}
						/>
					</div>
				</div>
			)}

			{showImage && !showHeader && (
				<Skeleton width="100%" height="200px" variant={variant} speed={speed} />
			)}

			<SkeletonText
				lines={lines}
				variant={variant}
				speed={speed}
				width="full"
			/>

			{showFooter && (
				<div
					className={`flex items-center justify-between pt-2 border-t ${StyleTheme.Divider.Subtle}`}
				>
					<Skeleton
						width="80px"
						height="1.5rem"
						variant={variant}
						speed={speed}
					/>
					<Skeleton
						width="100px"
						height="1.5rem"
						variant={variant}
						speed={speed}
					/>
				</div>
			)}
		</div>
	);
}
