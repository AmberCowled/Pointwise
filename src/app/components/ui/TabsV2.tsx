"use client";

import clsx from "clsx";
import type React from "react";

export type TabsV2Variant = "cosmic" | "simple";
export type TabsV2Size = "sm" | "md" | "lg";

export interface TabItemV2 {
	/**
	 * Unique identifier for the tab
	 */
	id: string;
	/**
	 * Label to display on the tab
	 */
	label: React.ReactNode;
	/**
	 * Optional icon to display with the label
	 */
	icon?: React.ReactNode;
	/**
	 * Whether the tab is disabled
	 */
	disabled?: boolean;
}

export interface TabsV2Props {
	/**
	 * Array of tab items to display
	 */
	items: TabItemV2[];
	/**
	 * Currently active tab ID
	 */
	value: string;
	/**
	 * Callback when a tab is selected
	 */
	onChange: (value: string) => void;
	/**
	 * Visual variant of the tabs
	 * @default 'cosmic'
	 */
	variant?: TabsV2Variant;
	/**
	 * Size of the tabs
	 * @default 'md'
	 */
	size?: TabsV2Size;
	/**
	 * Whether tabs should take full width
	 * @default true
	 */
	fullWidth?: boolean;
	/**
	 * Custom className for the container
	 */
	className?: string;
	/**
	 * Border thickness for the active tab indicator
	 * @default 2
	 */
	borderThickness?: number;
}

const tabSizeStyles: Record<TabsV2Size, string> = {
	sm: "py-2 text-xs",
	md: "py-3 text-sm",
	lg: "py-4 text-base",
};

/**
 * TabsV2 - Next generation tab component with animated cosmic border effect
 *
 * Features an animated bottom border on the selected tab with oscillating
 * purple/magenta light effects that move horizontally along the bottom edge.
 *
 * @example
 * ```tsx
 * <TabsV2
 *   items={AUTH_TABS}
 *   value={tab}
 *   onChange={handleTabChange}
 *   variant="cosmic"
 * />
 * ```
 */
export function TabsV2({
	items,
	value,
	onChange,
	variant = "cosmic",
	size = "md",
	fullWidth = true,
	className,
	borderThickness = 2,
}: TabsV2Props) {
	const isCosmic = variant === "cosmic";

	return (
		<div
			className={clsx(
				"flex gap-0",
				fullWidth ? "w-full" : "inline-flex",
				className,
			)}
			role="tablist"
			aria-label="Tabs"
		>
			{items.map((item) => {
				const isActive = value === item.id;
				const isDisabled = item.disabled;

				return (
					<button
						key={item.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						aria-controls={`tabpanel-${item.id}`}
						id={`tab-${item.id}`}
						disabled={isDisabled}
						onClick={() => !isDisabled && onChange(item.id)}
						className={clsx(
							"flex-1 flex items-center justify-center gap-2 rounded-none relative transition focus:outline-none",
							tabSizeStyles[size],
							isDisabled && "opacity-50 cursor-not-allowed",
							!isDisabled &&
								!isActive &&
								"text-zinc-400 hover:text-zinc-200 bg-zinc-900/20 backdrop-blur-sm border-b border-zinc-700/30 hover:bg-zinc-900/30 focus:ring-2 focus:ring-fuchsia-500/40",
							!isDisabled &&
								isActive &&
								(isCosmic
									? "text-zinc-100 bg-zinc-900/50 focus-visible:after:absolute focus-visible:after:bottom-0 focus-visible:after:left-0 focus-visible:after:right-0 focus-visible:after:h-[3px] focus-visible:after:bg-fuchsia-500/60 focus-visible:after:z-10"
									: "text-white focus:ring-2 focus:ring-fuchsia-500/40"),
						)}
					>
						{item.icon && <span className="shrink-0">{item.icon}</span>}
						<span>{item.label}</span>

						{/* Animated cosmic border for active tab */}
						{isActive && isCosmic && (
							<div
								className="absolute bottom-0 left-0 right-0 overflow-visible pointer-events-none"
								style={{
									height: `${borderThickness}px`,
								}}
							>
								<div
									className="absolute inset-0 animate-tab-border-oscillate"
									style={{
										background: `
											radial-gradient(
												ellipse 480px 80px at var(--tab-border-position) 50%,
												rgba(124,58,237,0.9) 0%,
												rgba(236,72,153,0.7) 30%,
												transparent 70%
											)
										`,
										filter:
											"drop-shadow(0 2px 8px rgba(124,58,237,0.6)) drop-shadow(0 3px 12px rgba(236,72,153,0.4)) saturate(140%) brightness(120%)",
										mixBlendMode: "screen",
									}}
								/>
							</div>
						)}

						{/* Simple solid border for non-cosmic variant */}
						{isActive && !isCosmic && (
							<div
								className="absolute bottom-0 left-0 right-0 bg-indigo-500"
								style={{
									height: `${borderThickness}px`,
								}}
							/>
						)}
					</button>
				);
			})}
		</div>
	);
}
