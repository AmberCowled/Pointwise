"use client";

import clsx from "clsx";
import type React from "react";
import { StyleTheme } from "./StyleTheme";

export type TabsVariant = "primary" | "secondary" | "filter";
export type TabsSize = "sm" | "md" | "lg";

export interface TabItem {
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

export interface TabsProps {
	/**
	 * Array of tab items to display
	 */
	items: TabItem[];
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
	 * @default 'primary'
	 */
	variant?: TabsVariant;
	/**
	 * Size of the tabs
	 * @default 'md'
	 */
	size?: TabsSize;
	/**
	 * Whether tabs should take full width
	 * @default true
	 */
	fullWidth?: boolean;
	/**
	 * Custom className for the container
	 */
	className?: string;
}

const variantStyles: Record<TabsVariant, string> = {
	primary: "bg-zinc-800/60",
	secondary: "bg-zinc-900/40",
	filter: "", // No container background for filter variant
};

const sizeStyles: Record<TabsSize, Record<TabsVariant, string>> = {
	sm: {
		primary: "p-0.5",
		secondary: "p-0.5",
		filter: "", // No padding for filter variant
	},
	md: {
		primary: "p-1",
		secondary: "p-1",
		filter: "", // No padding for filter variant
	},
	lg: {
		primary: "p-1.5",
		secondary: "p-1.5",
		filter: "", // No padding for filter variant
	},
};

const tabSizeStyles: Record<TabsSize, string> = {
	sm: "py-1 text-xs",
	md: "py-2 text-sm",
	lg: "py-2.5 text-base",
};

const filterTabSizeStyles: Record<TabsSize, string> = {
	sm: "px-2 py-1 text-xs",
	md: "px-3 py-1 text-xs",
	lg: "px-4 py-1.5 text-sm",
};

const activeTabStyles: Record<TabsVariant, string> = {
	primary: `${StyleTheme.Container.BackgroundSolid} ${StyleTheme.Text.PrimaryBright}`,
	secondary: `bg-zinc-800 ${StyleTheme.Text.PrimaryBright}`,
	filter: `border-indigo-400/80 bg-indigo-500/20 ${StyleTheme.Text.PrimaryBright} ${StyleTheme.Shadow.Inner}`,
};

const inactiveTabStyles: Record<TabsVariant, string> = {
	primary: `${StyleTheme.Text.Secondary} hover:text-zinc-200`,
	secondary: `${StyleTheme.Text.Muted} hover:text-zinc-300`,
	filter: `${StyleTheme.Container.Border.Primary} ${StyleTheme.Text.Secondary} hover:border-indigo-400/60 hover:text-white`,
};

export function Tabs({
	items,
	value,
	onChange,
	variant = "primary",
	size = "md",
	fullWidth = true,
	className,
}: TabsProps) {
	const isFilterVariant = variant === "filter";

	return (
		<div
			className={clsx(
				"flex",
				isFilterVariant
					? "flex-wrap items-center gap-2"
					: clsx(
							"rounded-xl",
							variantStyles[variant],
							sizeStyles[size][variant],
							fullWidth ? "w-full" : "inline-flex",
						),
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
							isFilterVariant
								? clsx(
										"rounded-full border font-semibold tracking-wide transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40",
										filterTabSizeStyles[size],
									)
								: clsx(
										"flex-1 flex items-center justify-center gap-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40",
										tabSizeStyles[size],
									),
							isDisabled && "opacity-50 cursor-not-allowed",
							!isDisabled &&
								(isActive
									? activeTabStyles[variant]
									: inactiveTabStyles[variant]),
						)}
					>
						{item.icon && <span className="shrink-0">{item.icon}</span>}
						<span>{item.label}</span>
					</button>
				);
			})}
		</div>
	);
}
