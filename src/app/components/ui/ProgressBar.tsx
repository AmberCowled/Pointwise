"use client";

import clsx from "clsx";
import type React from "react";
import { StyleTheme } from "./StyleTheme";

export interface ProgressBarProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "maxValue"> {
	value: number;
	maxValue: number;
	className?: string;
	heightClass?: string;

	/**
	 * Optional callback to override the color class.
	 *
	 * @param normalisedUsage A number in [0, 1] representing how full the progress bar is (0 = empty, 1 = max).
	 * @returns A Tailwind class name (e.g. "bg-emerald-400") to use instead of the default color.
	 */
	overwriteColorClass?: (normalisedUsage: number) => string;
}

function getNormalisedUsage(value: number, maxValue: number): number {
	return maxValue > 0.0 ? Math.min(1.0, Math.max(0.0, value / maxValue)) : 0.0;
}

export function ProgressBar({
	value,
	maxValue,
	className,
	heightClass,
	overwriteColorClass,
}: ProgressBarProps) {
	return (
		<div
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={maxValue}
			className={clsx(
				`w-full rounded-full ${StyleTheme.Skeleton.Primary}`,
				heightClass ? heightClass : "h-1",
				className,
			)}
		>
			<div
				className={clsx(
					"rounded-full transition-all",
					heightClass ? heightClass : "h-1",
					overwriteColorClass
						? overwriteColorClass(getNormalisedUsage(value, maxValue))
						: "bg-indigo-400",
				)}
				style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
			/>
		</div>
	);
}
