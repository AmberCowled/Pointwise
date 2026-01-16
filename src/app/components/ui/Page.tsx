import CosmicBackground from "@pointwise/app/components/ui/CosmicBackground";
import clsx from "clsx";
import type { ReactNode } from "react";

interface PageProps {
	children: ReactNode;
	className?: string;
	/**
	 * Height behavior
	 * - 'full': Fixed full viewport height (h-screen)
	 * - 'auto': Sizes to content (h-auto, no min-height)
	 * - 'constrained': Minimum full height but can grow (min-h-screen) - default
	 * @default 'constrained'
	 */
	height?: "full" | "auto" | "constrained";
	/**
	 * Width behavior
	 * - 'full': Full width (w-full) - default
	 * - 'auto': Sizes to content (w-auto)
	 * - 'constrained': Full width (w-full) - same as 'full', for backwards compatibility
	 * @default 'constrained'
	 */
	width?: "full" | "auto" | "constrained";
	backgroundGlow?: boolean;
}

const heightStyles: Record<NonNullable<PageProps["height"]>, string> = {
	full: "h-screen",
	auto: "h-auto",
	constrained: "min-h-screen",
};

const widthStyles: Record<NonNullable<PageProps["width"]>, string> = {
	full: "w-full",
	auto: "w-auto",
	constrained: "w-full",
};

export default function Page({
	children,
	className,
	height = "constrained",
	width = "constrained",
	backgroundGlow = true,
}: PageProps) {
	return (
		<div
			className={clsx(
				"text-zinc-100 flex flex-col items-center relative overflow-y-auto overflow-x-hidden",
				heightStyles[height],
				widthStyles[width],
				className,
			)}
		>
			{backgroundGlow && <CosmicBackground animate={true} />}
			{children}
		</div>
	);
}
