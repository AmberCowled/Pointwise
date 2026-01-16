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
	/**
	 * Visual intensity of nebula and stars
	 * @default "medium"
	 */
	intensity?: "low" | "medium" | "high";
}

/**
 * Cosmic background component with layered nebula gradients and star field
 * Designed for dark, premium gamified productivity app aesthetic
 */
export default function CosmicBackground({
	animate = true,
	className,
	intensity = "medium",
}: CosmicBackgroundProps) {
	// Adjust opacity based on intensity
	const getOpacity = (base: number) => {
		const multipliers = { low: 0.6, medium: 1.0, high: 1.4 };
		return Math.min(base * multipliers[intensity], 1);
	};

	return (
		<div className={clsx("absolute inset-0 -z-10", className)}>
			{/* Nebula layer - radial gradients for cosmic effect */}
			<div
				className={clsx("absolute inset-0", animate && "animate-cosmic-drift")}
				style={{
					backgroundImage: `
						radial-gradient(circle at 20% 30%, rgba(124,58,237,${getOpacity(0.25)}), transparent 60%),
						radial-gradient(circle at 80% 20%, rgba(59,130,246,${getOpacity(0.22)}), transparent 55%),
						radial-gradient(circle at 60% 80%, rgba(236,72,153,${getOpacity(0.2)}), transparent 65%),
						radial-gradient(circle at 40% 60%, rgba(67,56,202,${getOpacity(0.16)}), transparent 70%)
					`,
				}}
			/>

			{/* Star field layer - scattered points of light */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,${getOpacity(0.8)}), transparent 80%),
						radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,${getOpacity(0.6)}), transparent 80%),
						radial-gradient(1.5px 1.5px at 70% 40%, rgba(255,255,255,${getOpacity(0.5)}), transparent 80%),
						radial-gradient(1px 1px at 45% 60%, rgba(255,255,255,${getOpacity(0.4)}), transparent 80%),
						radial-gradient(2.5px 2.5px at 85% 70%, rgba(255,255,255,${getOpacity(0.9)}), transparent 80%),
						radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,${getOpacity(0.5)}), transparent 80%),
						radial-gradient(1.5px 1.5px at 55% 15%, rgba(255,255,255,${getOpacity(0.6)}), transparent 80%),
						radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,${getOpacity(0.4)}), transparent 80%),
						radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,${getOpacity(0.3)}), transparent 80%),
						radial-gradient(1.5px 1.5px at 75% 85%, rgba(255,255,255,${getOpacity(0.7)}), transparent 80%)
					`,
				}}
			/>
		</div>
	);
}
