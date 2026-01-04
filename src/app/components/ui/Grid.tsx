import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Props for the Grid component
 */
export interface GridProps {
	/**
	 * Content to be rendered inside the grid
	 */
	children: ReactNode;

	/**
	 * Responsive column configuration
	 * - `default`: Base columns (mobile, no prefix)
	 * - `sm`: Columns at sm breakpoint (640px)
	 * - `md`: Columns at md breakpoint (768px)
	 * - `lg`: Columns at lg breakpoint (1024px)
	 * @default { default: 1 }
	 */
	columns?: {
		default?: number;
		sm?: number;
		md?: number;
		lg?: number;
	};

	/**
	 * Spacing between grid items
	 * @default 'md'
	 */
	gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";

	/**
	 * Additional CSS classes to apply to the grid
	 */
	className?: string;
}

/**
 * Grid - Responsive CSS Grid layout component
 *
 * **Props:**
 * - `children: ReactNode` - Content to be rendered inside the grid
 * - `columns?: { default?: number; sm?: number; md?: number; lg?: number }` - Responsive column configuration (default: { default: 1 })
 * - `gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"` - Spacing between grid items (default: "md")
 * - `className?: string` - Additional CSS classes
 *
 * The Grid component uses CSS Grid with Tailwind's responsive breakpoints:
 * - Base (default): No prefix
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 *
 * @example
 * ```tsx
 * // 1 column on mobile, 2 on tablet, 3 on desktop
 * <Grid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
 *   <ProjectCard />
 *   <ProjectCard />
 *   <ProjectCard />
 * </Grid>
 *
 * // Simplified (defaults to 1 column)
 * <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
 *   {items.map(item => <Item key={item.id} />)}
 * </Grid>
 * ```
 *
 * @param {GridProps} props - The props for the Grid component.
 * @returns {JSX.Element} The rendered Grid component.
 */
export default function Grid({
	children,
	columns,
	gap = "md",
	className,
}: GridProps) {
	const gapClasses = {
		none: "gap-0",
		xs: "gap-1",
		sm: "gap-2",
		md: "gap-4",
		lg: "gap-6",
		xl: "gap-8",
	};

	// Column class mapping for Tailwind JIT
	const columnClassMap: Record<number, string> = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
		4: "grid-cols-4",
		5: "grid-cols-5",
		6: "grid-cols-6",
	};

	const smColumnClassMap: Record<number, string> = {
		1: "sm:grid-cols-1",
		2: "sm:grid-cols-2",
		3: "sm:grid-cols-3",
		4: "sm:grid-cols-4",
		5: "sm:grid-cols-5",
		6: "sm:grid-cols-6",
	};

	const mdColumnClassMap: Record<number, string> = {
		1: "md:grid-cols-1",
		2: "md:grid-cols-2",
		3: "md:grid-cols-3",
		4: "md:grid-cols-4",
		5: "md:grid-cols-5",
		6: "md:grid-cols-6",
	};

	const lgColumnClassMap: Record<number, string> = {
		1: "lg:grid-cols-1",
		2: "lg:grid-cols-2",
		3: "lg:grid-cols-3",
		4: "lg:grid-cols-4",
		5: "lg:grid-cols-5",
		6: "lg:grid-cols-6",
	};

	// Build column classes based on responsive configuration
	const columnClasses: string[] = [];

	// Default to 1 column if no columns specified
	const defaultCols = columns?.default ?? 1;
	if (columnClassMap[defaultCols]) {
		columnClasses.push(columnClassMap[defaultCols]);
	}

	if (columns?.sm !== undefined && smColumnClassMap[columns.sm]) {
		columnClasses.push(smColumnClassMap[columns.sm]);
	}

	if (columns?.md !== undefined && mdColumnClassMap[columns.md]) {
		columnClasses.push(mdColumnClassMap[columns.md]);
	}

	if (columns?.lg !== undefined && lgColumnClassMap[columns.lg]) {
		columnClasses.push(lgColumnClassMap[columns.lg]);
	}

	return (
		<div
			className={clsx(
				"grid w-full auto-rows-fr",
				columnClasses,
				gapClasses[gap],
				className,
			)}
		>
			{children}
		</div>
	);
}
