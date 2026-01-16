"use client";

import clsx from "clsx";

interface CosmicBackgroundProps {
	/**
	 * Enable subtle animation (respects prefers-reduced-motion)
	 * @default true
	 */
	animate?: boolean;
	/**
	 * Additional CSS classes
	 */
	className?: string;
}

/**
 * Cosmic background component with solid black base, layered nebula gradients and star field
 * Designed for dark, premium gamified productivity app aesthetic
 * Ensures consistent appearance across all devices and backgrounds
 */
export default function CosmicBackground({
	animate = true,
	className,
}: CosmicBackgroundProps) {
	return (
		<div className={clsx("absolute inset-0 -z-10", className)}>
			{/* Base black background */}
			<div className="absolute inset-0 bg-black" />

			{/* Nebula layer - radial gradients for cosmic effect */}
			<div
				className={clsx("absolute inset-0", animate && "animate-cosmic-drift")}
				style={{
					backgroundImage: `
						radial-gradient(circle at 50% 40%, rgba(124,58,237,0.45), transparent 70%),
						radial-gradient(circle at 20% 30%, rgba(124,58,237,0.32), transparent 65%),
						radial-gradient(circle at 80% 20%, rgba(59,130,246,0.3), transparent 60%),
						radial-gradient(circle at 60% 80%, rgba(236,72,153,0.26), transparent 70%),
						radial-gradient(circle at 40% 60%, rgba(67,56,202,0.22), transparent 75%)
					`,
				}}
			/>

			{/* Star field layer - scattered points of light */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						radial-gradient(2.5px 2.5px at 12% 18%, rgba(255,255,255,0.85), transparent 80%),
						radial-gradient(1.5px 1.5px at 32% 78%, rgba(255,255,255,0.65), transparent 80%),
						radial-gradient(2px 2px at 68% 38%, rgba(255,255,255,0.55), transparent 80%),
						radial-gradient(1px 1px at 45% 58%, rgba(255,255,255,0.45), transparent 80%),
						radial-gradient(3px 3px at 86% 72%, rgba(255,255,255,0.9), transparent 80%),
						radial-gradient(1px 1px at 18% 70%, rgba(255,255,255,0.55), transparent 80%),
						radial-gradient(2px 2px at 55% 14%, rgba(255,255,255,0.7), transparent 80%),
						radial-gradient(1px 1px at 90% 28%, rgba(255,255,255,0.5), transparent 80%),
						radial-gradient(1.5px 1.5px at 25% 45%, rgba(255,255,255,0.4), transparent 80%),
						radial-gradient(2px 2px at 75% 84%, rgba(255,255,255,0.8), transparent 80%),
						radial-gradient(1px 1px at 8% 55%, rgba(255,255,255,0.35), transparent 80%),
						radial-gradient(1.5px 1.5px at 92% 60%, rgba(255,255,255,0.6), transparent 80%)
					`,
				}}
			/>

			{/* Dust layer - faint background sparkle */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						radial-gradient(1px 1px at 6% 30%, rgba(255,255,255,0.18), transparent 70%),
						radial-gradient(1px 1px at 20% 85%, rgba(255,255,255,0.16), transparent 70%),
						radial-gradient(1px 1px at 40% 20%, rgba(255,255,255,0.14), transparent 70%),
						radial-gradient(1px 1px at 60% 65%, rgba(255,255,255,0.16), transparent 70%),
						radial-gradient(1px 1px at 78% 40%, rgba(255,255,255,0.14), transparent 70%),
						radial-gradient(1px 1px at 88% 15%, rgba(255,255,255,0.16), transparent 70%),
						radial-gradient(1px 1px at 12% 50%, rgba(255,255,255,0.12), transparent 70%),
						radial-gradient(1px 1px at 52% 90%, rgba(255,255,255,0.15), transparent 70%)
					`,
				}}
			/>
		</div>
	);
}
