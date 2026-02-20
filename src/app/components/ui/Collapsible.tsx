"use client";

import clsx from "clsx";
import type React from "react";
import { useId, useState } from "react";
import { IoAdd, IoRemove } from "react-icons/io5";
import Container from "./Container";
import { StyleTheme } from "./StyleTheme";

/**
 * Custom props for the Collapsible component
 */
export interface CollapsibleCustomProps {
	/**
	 * Label text displayed in the clickable header
	 */
	label: React.ReactNode;

	/**
	 * Content to be rendered inside the collapsible section
	 */
	children: React.ReactNode;

	/**
	 * Default collapsed state (uncontrolled component)
	 * @default false (expanded by default)
	 */
	defaultCollapsed?: boolean;

	/**
	 * Callback fired when the collapsed state changes
	 * Receives the new collapsed state as a boolean (true = collapsed, false = expanded)
	 * @param collapsed - The new collapsed state (true = collapsed, false = expanded)
	 */
	onChange?: (collapsed: boolean) => void;

	/**
	 * Width behavior for the container
	 * - 'full': Takes full width of parent (w-full)
	 * - 'auto': Sizes to content (w-auto)
	 * - 'constrained': Full width with max-width and padding (default)
	 * @default 'constrained'
	 */
	width?: "full" | "auto" | "constrained";

	/**
	 * Additional CSS classes to apply to the component
	 */
	className?: string;
}

/**
 * Props for the Collapsible component
 */
export type CollapsibleProps = CollapsibleCustomProps &
	Omit<React.HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Collapsible - Reusable collapsible section component
 *
 * Built on Container component following V2 component standards. Manages its own
 * expanded/collapsed state internally (uncontrolled) and provides an onChange callback.
 *
 * **Custom Props:**
 * - `label: ReactNode` - Label text displayed in the clickable header
 * - `children: ReactNode` - Content to be rendered inside the collapsible section
 * - `defaultCollapsed?: boolean` - Default collapsed state (default: false = expanded by default)
 * - `onChange?: (collapsed: boolean) => void` - Callback fired when collapsed state changes
 * - `width?: "full" | "auto" | "constrained"` - Width behavior (default: "constrained")
 * - `className?: string` - Additional CSS classes
 *
 * All standard HTML div attributes (except `className`) are also supported.
 *
 * **Usage:**
 * ```tsx
 * // Collapsed by default
 * <Collapsible label="Filters" defaultCollapsed={true} onChange={(collapsed) => console.log(collapsed)}>
 *   <TaskFilters {...props} />
 * </Collapsible>
 *
 * // Expanded by default
 * <Collapsible label="Advanced Options" width="full" defaultCollapsed={false}>
 *   <AdvancedOptions />
 * </Collapsible>
 * ```
 *
 * @param {CollapsibleProps} props - The props for the Collapsible component.
 * @returns {JSX.Element} The rendered Collapsible component.
 */
export default function Collapsible({
	label,
	children,
	defaultCollapsed = false,
	onChange,
	width = "constrained",
	className,
	...props
}: CollapsibleProps) {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const contentId = useId();

	const handleToggle = () => {
		const newCollapsed = !isCollapsed;
		setIsCollapsed(newCollapsed);
		onChange?.(newCollapsed);
	};

	return (
		<Container
			{...props}
			direction="vertical"
			width={width}
			gap="none"
			className={className}
		>
			{/* Clickable Header */}
			<button
				type="button"
				onClick={handleToggle}
				aria-expanded={!isCollapsed}
				aria-controls={contentId}
				className={`group flex w-full items-center gap-2 px-1 py-2.5 text-left text-sm font-medium text-zinc-100 transition-colors ${StyleTheme.Hover.TextBrighten} focus:outline-none rounded-t-lg`}
			>
				<span>{label}</span>
				{isCollapsed ? (
					<IoAdd className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-200" />
				) : (
					<IoRemove className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-200" />
				)}
			</button>

			{/* Collapsible Content */}
			<Container
				direction="vertical"
				width="full"
				gap="none"
				className={clsx(
					"transition-[height] duration-300 ease-in-out overflow-hidden",
					isCollapsed ? "h-0" : "h-auto",
				)}
			>
				{children}
			</Container>
		</Container>
	);
}
