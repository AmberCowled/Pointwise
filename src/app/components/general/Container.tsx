import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Props for the Container component
 */
export interface ContainerProps {
	/**
	 * Content to be rendered inside the container
	 */
	children: ReactNode;

	/**
	 * Additional CSS classes to apply to the container
	 */
	className?: string;

	/**
	 * Maximum width constraint for the container
	 * Only applies when `fullWidth={true}`
	 * @default '6xl'
	 */
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl";

	/**
	 * Spacing between child elements
	 * @default 'md'
	 */
	gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";

	/**
	 * Flex direction for child elements
	 * - 'vertical': Children stack vertically (flex-col)
	 * - 'horizontal': Children align horizontally (flex-row)
	 * @default 'horizontal'
	 */
	direction?: "vertical" | "horizontal";

	/**
	 * Whether the container should take full width with max-width constraints
	 * - `true`: Container takes full width with max-width, auto margins, and padding
	 * - `false`: Container only takes width of its content (w-auto)
	 * @default true
	 */
	fullWidth?: boolean;
}

/**
 * Container - Layout component for constrained-width content with flexible spacing
 *
 * **Props:**
 * - `children: ReactNode` - Content to be rendered inside the container
 * - `className?: string` - Additional CSS classes
 * - `maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl"` - Maximum width constraint (default: "6xl", only applies when fullWidth={true})
 * - `gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"` - Spacing between child elements (default: "md")
 * - `direction?: "vertical" | "horizontal"` - Flex direction (default: "horizontal")
 * - `fullWidth?: boolean` - Whether container takes full width with constraints (default: true)
 *
 * When `fullWidth={true}`, the container applies:
 * - Full width (`w-full`)
 * - Centered with auto margins (`mx-auto`)
 * - Maximum width constraint based on `maxWidth` prop
 * - Responsive horizontal padding (`px-2 sm:px-6 lg:px-8`)
 *
 * When `fullWidth={false}`, the container only takes the width of its content.
 *
 * @example
 * ```tsx
 * // Full-width container with max-width constraint
 * <Container maxWidth="2xl" gap="lg" direction="vertical">
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </Container>
 *
 * // Auto-width container (shrinks to content)
 * <Container fullWidth={false} gap="sm" direction="horizontal">
 *   <BrandHeader />
 *   <Search />
 * </Container>
 * ```
 *
 * @param {ContainerProps} props - The props for the Container component.
 * @returns {JSX.Element} The rendered Container component.
 */
export default function Container({
	children,
	className,
	maxWidth = "6xl",
	direction = "horizontal",
	fullWidth = true,
	gap = "md",
}: ContainerProps) {
	const maxWidthClasses = {
		sm: "sm:max-w-sm",
		md: "sm:max-w-md",
		lg: "sm:max-w-lg",
		xl: "sm:max-w-xl",
		"2xl": "sm:max-w-2xl",
		"6xl": "sm:max-w-6xl",
	};

	const directionClasses = {
		vertical: "flex-col",
		horizontal: "flex-row",
	};

	const gapClasses = {
		none: "gap-0",
		xs: "gap-1",
		sm: "gap-2",
		md: "gap-4",
		lg: "gap-6",
		xl: "gap-8",
	};

	return (
		<div
			className={clsx(
				"flex items-center",
				gapClasses[gap],
				fullWidth
					? ["mx-auto w-full", maxWidthClasses[maxWidth], "px-2 sm:px-6 lg:px-8"]
					: "w-auto",
				directionClasses[direction],
				className,
			)}
		>
			{children}
		</div>
	);
}
