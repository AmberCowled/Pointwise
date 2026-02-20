"use client";

import clsx from "clsx";
import React from "react";
import Container from "./Container";
import { Spinner } from "./Spinner";
import { StyleTheme } from "./StyleTheme";

export type CardVariants = "primary" | "secondary" | "danger";
export type CardSizes = "xs" | "sm" | "md" | "lg" | "xl";
type CardFlex = "shrink" | "default" | "grow";

/**
 * Custom props for the Card component
 *
 * These props appear first in IntelliSense autocomplete when using the component.
 * All standard HTML div attributes are also supported via Container.
 */
export interface CardCustomProps {
	/**
	 * Visual variant style
	 * @default 'primary'
	 */
	variant?: CardVariants;

	/**
	 * Size of the card (affects padding)
	 * @default 'md'
	 */
	size?: CardSizes;

	/**
	 * Flex behavior for the card wrapper
	 * - 'shrink': Prevents the card from shrinking (flex-shrink-0)
	 * - 'default': Normal flex behavior
	 * - 'grow': Card takes up available space (flex-1 min-w-0)
	 * @default 'default'
	 */
	flex?: CardFlex;

	/**
	 * Callback fired when the card is clicked
	 * Only fires when clicking the card itself, not interactive elements inside
	 * Receives no parameters (just a notification that the card was clicked)
	 * Disabled during loading state
	 */
	onClick?: () => void;

	/**
	 * Main title displayed in the card header
	 */
	title?: React.ReactNode;

	/**
	 * Small uppercase label displayed above the title
	 */
	label?: React.ReactNode;

	/**
	 * Action buttons/elements displayed on the right side of the header
	 * Can be a single element or an array of elements
	 * Hidden during loading state
	 */
	action?: React.ReactNode | React.ReactNode[];

	/**
	 * Whether to show loading state
	 * When true, displays spinner instead of children but keeps header visible
	 * @default false
	 */
	loading?: boolean;

	/**
	 * Optional loading message to display below spinner
	 */
	loadingMessage?: string;

	/**
	 * Content to be rendered inside the card
	 * Renders directly without a wrapper for full layout control
	 */
	children?: React.ReactNode;

	/**
	 * Additional CSS classes to apply to the card
	 */
	className?: string;
}

/**
 * Props for the Card component
 */
export type CardProps = CardCustomProps &
	Omit<React.HTMLAttributes<HTMLDivElement>, "onClick" | "className">;

const baseStyle = StyleTheme.Container.Background;

const variantStyles: Record<CardVariants, string> = {
	primary: `rounded-2xl border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.Shadow}`,
	secondary: `rounded-3xl border ${StyleTheme.Container.Border.Secondary}`,
	danger: `rounded-2xl border ${StyleTheme.Container.Border.Danger} ${StyleTheme.Container.BackgroundDanger} ${StyleTheme.Text.Primary}`,
};

const sizeStyles: Record<CardSizes, string> = {
	xs: "p-2",
	sm: "p-3",
	md: "p-4",
	lg: "p-6",
	xl: "p-8",
};

const flexClasses: Record<CardFlex, string> = {
	shrink: "flex-shrink-0",
	default: "",
	grow: "flex-1 min-w-0",
};

/**
 * Card - Simplified card component built on Container
 *
 * Much simpler by leveraging Container's built-in onClick handling and layout capabilities.
 * The main Container acts as the card wrapper, a Container handles the header layout, and children
 * render directly without a wrapper for full user control.
 *
 * **Custom Props:**
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Card size/padding (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `onClick?: () => void` - Callback fired when card is clicked (only fires on non-interactive areas, disabled during loading)
 * - `title?: ReactNode` - Main title displayed in the card header
 * - `label?: ReactNode` - Small uppercase label displayed above the title
 * - `action?: ReactNode | ReactNode[]` - Action buttons/elements displayed on the right side of the header (hidden during loading)
 * - `loading?: boolean` - Whether to show loading state (default: false)
 * - `loadingMessage?: string` - Optional loading message displayed below spinner
 * - `children?: ReactNode` - Card content (renders directly without wrapper)
 * - `className?: string` - Additional CSS classes
 *
 * All standard HTML div attributes (except `onClick` and `className`) are also supported via Container.
 *
 * **Click Handling:**
 * When `onClick` is provided, the card becomes visually clickable (cursor-pointer, hover effects)
 * but respects nested interactive elements (Links, Buttons, inputs, etc.). The callback only
 * fires when clicking the card itself, not when clicking interactive elements inside. Click handling
 * is disabled during loading state. Container handles all interactive element detection automatically.
 *
 * **Header:**
 * Header section is rendered when `title`, `label`, or `action` is provided. Uses nested Containers
 * for clean layout: vertical Container with left (label/title) and right (actions) sub-containers.
 * Action elements are automatically hidden during loading state.
 *
 * **Loading State:**
 * When `loading` is true, a spinner is displayed instead of children, but the header remains visible.
 * An optional `loadingMessage` can be displayed below the spinner.
 *
 * **Content:**
 * Children render directly without a wrapper, giving you full control over layout using Container
 * components as needed.
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <Container direction="vertical" gap="md">
 *     <p>Content</p>
 *   </Container>
 * </Card>
 *
 * // Card with header and onClick
 * <Card
 *   title="Tasks"
 *   label="Overview"
 *   action={<Button>Create</Button>}
 *   onClick={() => handleClick()}
 *   flex="grow"
 * >
 *   <Container direction="vertical" gap="sm">
 *     {tasks.map(...)}
 *   </Container>
 * </Card>
 *
 * // Card with loading
 * <Card
 *   title="Tasks"
 *   loading={isLoading}
 *   loadingMessage="Loading..."
 * >
 *   Content
 * </Card>
 * ```
 */
export default function Card({
	variant = "primary",
	size = "md",
	flex = "default",
	onClick,
	title,
	label,
	action,
	loading = false,
	loadingMessage,
	children,
	className,
	...props
}: CardProps) {
	const actions = Array.isArray(action) ? action : action ? [action] : [];
	const hasHeader = title || label || actions.length > 0;
	const shouldShowActions = actions.length > 0 && !loading;

	// Convert no-param onClick to Container's event handler
	const handleClick =
		onClick && !loading
			? (_e: React.MouseEvent<HTMLDivElement>) => {
					onClick();
				}
			: undefined;

	return (
		<Container
			{...props}
			direction="vertical"
			width="full"
			gap="none"
			onClick={handleClick}
			className={clsx(
				baseStyle,
				variantStyles[variant],
				sizeStyles[size],
				flexClasses[flex],
				className,
			)}
		>
			{hasHeader && (
				<Container direction="vertical" width="full" gap="sm">
					<Container
						direction="horizontal"
						width="full"
						gap="sm"
						className="flex-wrap justify-between"
					>
						<Container
							direction="vertical"
							width="auto"
							gap="xs"
							className="items-start text-left"
						>
							{label && (
								<p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
									{label}
								</p>
							)}
							{title && (
								<h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
							)}
						</Container>
						{shouldShowActions && (
							<Container width="auto" gap="sm" className="flex-wrap">
								{actions.map((actionItem, index) => {
									// If actionItem is a React element with a key, use it; otherwise use index
									const key =
										React.isValidElement(actionItem) && actionItem.key
											? actionItem.key
											: `action-${index}`;
									return (
										<React.Fragment key={key}>{actionItem}</React.Fragment>
									);
								})}
							</Container>
						)}
					</Container>
				</Container>
			)}

			{loading ? (
				<Container
					direction="vertical"
					gap="md"
					width="full"
					className="justify-center py-12"
				>
					<Spinner size="lg" variant="primary" />
					{loadingMessage && (
						<p className="text-sm text-zinc-400">{loadingMessage}</p>
					)}
				</Container>
			) : (
				children
			)}
		</Container>
	);
}

// Named export for compatibility with both import styles
export { Card };
