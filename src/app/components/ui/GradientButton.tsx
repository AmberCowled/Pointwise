"use client";

import clsx from "clsx";
import type React from "react";
import { StyleTheme } from "./StyleTheme";

type Props = {
	children: React.ReactNode;
	type?: "button" | "submit" | "reset";
	loading?: boolean;
	disabled?: boolean;
	className?: string;
	onClick?: () => void;
	fullWidth?: boolean;
	iconLeft?: React.ReactNode;
	iconRight?: React.ReactNode;
	"aria-label"?: string;
};

export default function GradientButton({
	children,
	type = "button",
	loading = false,
	disabled = false,
	className,
	onClick,
	iconLeft,
	iconRight,
	...rest
}: Props) {
	const isDisabled = disabled || loading;

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={isDisabled}
			aria-busy={loading || undefined}
			className={clsx(
				"relative overflow-hidden rounded-lg py-2.5 text-sm font-medium transition focus:outline-none",
				"w-full",
				isDisabled
					? StyleTheme.GalaxyGradientDisabled
					: StyleTheme.GalaxyGradient,
				"shadow-lg",
				isDisabled
					? StyleTheme.Shadow.ButtonDisabled
					: StyleTheme.Shadow.ButtonPrimary.replace("shadow-lg ", ""),
				!isDisabled && "hover:animate-rotate-gradient",
				!isDisabled && `focus:${StyleTheme.Shadow.Focus}`,
				isDisabled && "opacity-70 cursor-not-allowed",
				className,
			)}
			{...rest}
		>
			{/* subtle overlay to make text always readable */}
			<span className="pointer-events-none absolute inset-0 bg-white/0" />

			<span className="relative z-10 inline-flex items-center justify-center gap-2 px-3">
				{loading && (
					<svg
						className="h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						aria-hidden="true"
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
				)}
				{!loading && iconLeft}
				<span>{children}</span>
				{!loading && iconRight}
			</span>
		</button>
	);
}
