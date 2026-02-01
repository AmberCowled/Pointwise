"use client";

import BorderGlow from "@pointwise/app/components/ui/BorderGlow";
import clsx from "clsx";
import type React from "react";
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
 * TabsV2 - Next generation tab component with glow underline
 *
 * @example
 * ```tsx
 * <TabsV2
 *   items={AUTH_TABS}
 *   value={tab}
 *   onChange={handleTabChange}
 * />
 * ```
 */
export function TabsV2({
	items,
	value,
	onChange,
	size = "md",
	fullWidth = true,
	className,
	borderThickness = 2,
}: TabsV2Props) {
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
							"flex-1 relative transition focus:outline-none",
							isDisabled && "opacity-50 cursor-not-allowed",
							!isDisabled &&
								!isActive &&
								"text-zinc-400 hover:text-zinc-200 bg-zinc-900/20 backdrop-blur-sm border-b border-zinc-700/30 hover:bg-zinc-900/30 focus:ring-2 focus:ring-fuchsia-500/40",
							!isDisabled &&
								isActive &&
								"text-white bg-zinc-900/50 focus:ring-2 focus:ring-fuchsia-500/40",
						)}
					>
						<BorderGlow
							bottom={isActive}
							top={false}
							left={false}
							right={false}
							thickness={borderThickness}
							className="w-full"
						>
							<div
								className={clsx(
									"flex items-center justify-center gap-2 rounded-none",
									tabSizeStyles[size],
								)}
							>
								{item.icon && <span className="shrink-0">{item.icon}</span>}
								<span>{item.label}</span>
							</div>
						</BorderGlow>
					</button>
				);
			})}
		</div>
	);
}
