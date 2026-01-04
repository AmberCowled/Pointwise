"use client";

import clsx from "clsx";
import type React from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "subtle" | "prominent";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: DividerOrientation;
	variant?: DividerVariant;
	label?: React.ReactNode;
	spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
	fullWidth?: boolean;
}

const variantBorderStyles: Record<DividerVariant, string> = {
	subtle: "border-white/10",
	prominent: "border-white/20",
};

const variantLabelStyles: Record<DividerVariant, string> = {
	subtle: "bg-zinc-900/60 text-zinc-400",
	prominent: "bg-zinc-900/80 text-zinc-300",
};

const spacingStyles: Record<
	NonNullable<DividerProps["spacing"]>,
	Record<DividerOrientation, string>
> = {
	none: {
		horizontal: "my-0",
		vertical: "mx-0",
	},
	xs: {
		horizontal: "my-1",
		vertical: "mx-1",
	},
	sm: {
		horizontal: "my-2",
		vertical: "mx-2",
	},
	md: {
		horizontal: "my-4",
		vertical: "mx-4",
	},
	lg: {
		horizontal: "my-6",
		vertical: "mx-6",
	},
	xl: {
		horizontal: "my-8",
		vertical: "mx-8",
	},
};

export function Divider({
	orientation = "horizontal",
	variant = "subtle",
	label,
	spacing = "md",
	fullWidth = true,
	className,
	...props
}: DividerProps) {
	const isHorizontal = orientation === "horizontal";
	const hasLabel = !!label;

	if (isHorizontal) {
		return (
			<div
				className={clsx(
					"relative",
					spacingStyles[spacing].horizontal,
					fullWidth ? "w-full" : "inline-block",
					className,
				)}
				{...props}
			>
				{hasLabel ? (
					<>
						<div className="absolute inset-0 flex items-center">
							<span
								className={clsx(
									"w-full border-t",
									variantBorderStyles[variant],
								)}
							/>
						</div>
						<div className="relative flex justify-center">
							<span
								className={clsx(
									"px-2 text-xs font-medium",
									variantLabelStyles[variant],
								)}
							>
								{label}
							</span>
						</div>
					</>
				) : (
					<span
						className={clsx(
							"block w-full border-t",
							variantBorderStyles[variant],
						)}
					/>
				)}
			</div>
		);
	}

	// Vertical divider
	return (
		<div
			className={clsx(
				"relative flex items-center",
				spacingStyles[spacing].vertical,
				className,
			)}
			role="separator"
			aria-orientation="vertical"
			{...props}
		>
			{hasLabel ? (
				<div className="flex flex-col items-center h-full">
					<span
						className={clsx("flex-1 border-l", variantBorderStyles[variant])}
					/>
					<span
						className={clsx(
							"px-1 py-2 text-xs font-medium whitespace-nowrap",
							variantLabelStyles[variant],
						)}
					>
						{label}
					</span>
					<span
						className={clsx("flex-1 border-l", variantBorderStyles[variant])}
					/>
				</div>
			) : (
				<span
					className={clsx("h-full border-l", variantBorderStyles[variant])}
				/>
			)}
		</div>
	);
}
