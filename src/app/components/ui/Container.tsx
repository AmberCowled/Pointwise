import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

/**
 * Check if an element is interactive (Link, Button, input, etc.)
 */
function isInteractive(element: HTMLElement): boolean {
	const tagName = element.tagName.toLowerCase();
	const role = element.getAttribute("role");

	// Check if element itself is interactive
	if (
		tagName === "a" ||
		tagName === "button" ||
		tagName === "input" ||
		tagName === "select" ||
		tagName === "textarea" ||
		role === "button" ||
		role === "link" ||
		element.hasAttribute("onClick")
	) {
		return true;
	}

	// Check if element is inside an interactive element
	if (element.closest("a, button, [role='button'], [role='link'], [onClick]")) {
		return true;
	}

	return false;
}

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
	 * Width behavior
	 * - 'full': Takes full width of parent (w-full) - use in Grid or when you need full width without padding
	 * - 'auto': Sizes to content (w-auto) - use for inline/compact layouts
	 * - 'constrained': Full width with max-width and padding - use for page-level containers
	 * @default 'constrained'
	 */
	width?: "full" | "auto" | "constrained";

	/**
	 * Whether the container should take full width with max-width constraints
	 * - `true`: Container takes full width with max-width, auto margins, and padding (same as width="constrained")
	 * - `false`: Container only takes width of its content (same as width="auto")
	 * @default true
	 * @deprecated Use `width` prop instead for clearer intent. This prop is kept for backward compatibility.
	 */
	fullWidth?: boolean;

	/**
	 * Click handler for the container
	 * Only fires when clicking non-interactive areas (respects nested Links/Buttons)
	 */
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

	/**
	 * Inline styles for the container
	 */
	style?: CSSProperties;

	/**
	 * Enable cosmic border effect
	 * @default false
	 */
	cosmicBorder?: boolean;

	/**
	 * Cosmic border thickness in pixels
	 * @default 2
	 */
	cosmicBorderThickness?: number;

	/**
	 * Enable cosmic border animation
	 * @default true
	 */
	cosmicBorderAnimate?: boolean;
}

/**
 * Container - Layout component for constrained-width content with flexible spacing
 *
 * **Props:**
 * - `children: ReactNode` - Content to be rendered inside the container
 * - `className?: string` - Additional CSS classes
 * - `maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl"` - Maximum width constraint (default: "6xl", only applies when width="constrained")
 * - `gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"` - Spacing between child elements (default: "md")
 * - `direction?: "vertical" | "horizontal"` - Flex direction (default: "horizontal")
 * - `width?: "full" | "auto" | "constrained"` - Width behavior (default: "constrained")
 *   - `"full"`: Takes full width of parent (w-full) - use in Grid or when you need full width without padding
 *   - `"auto"`: Sizes to content (w-auto) - use for inline/compact layouts
 *   - `"constrained"`: Full width with max-width and padding - use for page-level containers
 * - `fullWidth?: boolean` - Deprecated: Use `width` prop instead (kept for backward compatibility)
 * - `onClick?: (e: React.MouseEvent<HTMLDivElement>) => void` - Click handler (only fires on non-interactive areas)
 * - `cosmicBorder?: boolean` - Enable cosmic border effect using CSS border-image (default: false)
 * - `cosmicBorderThickness?: number` - Cosmic border thickness in pixels (default: 2)
 * - `cosmicBorderAnimate?: boolean` - Enable cosmic border animation (default: true)
 *
 * **Width Behaviors:**
 * - `width="constrained"` (default): Full width (`w-full`), centered with auto margins (`mx-auto`), maximum width constraint, and responsive horizontal padding
 * - `width="full"`: Full width (`w-full`) without padding or max-width - perfect for Grid items
 * - `width="auto"`: Sizes to content (`w-auto`) - for inline/compact layouts
 *
 * When `onClick` is provided, the container becomes visually clickable (cursor-pointer, hover effects)
 * but respects nested interactive elements (Links, Buttons, etc.).
 *
 * @example
 * ```tsx
 * // Constrained-width container (page-level, default)
 * <Container maxWidth="2xl" gap="lg" direction="vertical">
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </Container>
 *
 * // Full-width container in Grid (no padding/max-width)
 * <Grid columns={{ sm: 2 }}>
 *   <Container width="full" direction="vertical" gap="sm">
 *     <InputV2 label="Start Date" />
 *   </Container>
 * </Grid>
 *
 * // Auto-width container (shrinks to content)
 * <Container width="auto" gap="sm" direction="horizontal">
 *   <BrandHeader />
 *   <Search />
 * </Container>
 *
 * // Clickable container (respects nested Links/Buttons)
 * <Container onClick={() => openModal()}>
 *   <Link href="/details">Details</Link>
 *   <Button onClick={handleSettings}>Settings</Button>
 * </Container>
 *
 * // Container with cosmic border effect
 * <Container cosmicBorder cosmicBorderThickness={3} className="bg-zinc-900/80 p-6 rounded-lg">
 *   <h2>Cosmic Content</h2>
 *   <p>Content with animated cosmic border using CSS border-image</p>
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
	width,
	fullWidth = true,
	gap = "md",
	onClick,
	style,
	cosmicBorder = false,
	cosmicBorderThickness = 2,
	cosmicBorderAnimate = true,
}: ContainerProps) {
	// Extract rounded classes from className for cosmic border consistency
	const extractRoundedClasses = (value?: string) =>
		value?.split(/\s+/).filter((token) => token.startsWith("rounded")) ?? [];

	const borderWidthPattern =
		/^border(?:-(?:[trblxy]))?(?:-(?:0|[1-9]\d*|\[[^\]]+\]))?$/;
	const borderAxisPattern = /^border-(?:x|y)$/;

	const extractBorderWidthClasses = (value?: string) => {
		if (!value) return [];
		return value
			.split(/\s+/)
			.filter(
				(token) =>
					borderWidthPattern.test(token) || borderAxisPattern.test(token),
			);
	};

	const stripBorderClasses = (value?: string) => {
		if (!value) return value;
		return value
			.split(/\s+/)
			.filter((token) => !token.startsWith("border"))
			.join(" ");
	};

	const roundedClasses = cosmicBorder
		? extractRoundedClasses(className).length
			? extractRoundedClasses(className)
			: ["rounded-xl"]
		: [];
	const stripRoundedClasses = (value?: string) => {
		if (!value) return value;
		return value
			.split(/\s+/)
			.filter((token) => !token.startsWith("rounded"))
			.join(" ");
	};
	const processedClassName = cosmicBorder
		? stripRoundedClasses(stripBorderClasses(className))
		: className;
	const borderWidthClasses = cosmicBorder
		? extractBorderWidthClasses(className)
		: [];

	// Extract border width value from classes (e.g., "border-2" -> "2px")
	const getBorderWidthValue = (classes: string[]) => {
		for (const cls of classes) {
			const match = cls.match(/^border-(?:(\d+)|\[([^\]]+)\])$/);
			if (match) {
				return match[1] ? `${match[1]}px` : match[2];
			}
		}
		return `${cosmicBorderThickness}px`;
	};

	const borderWidth = cosmicBorder
		? getBorderWidthValue(borderWidthClasses)
		: "0px";

	// Cosmic border styles
	const cosmicBorderStyle = cosmicBorder
		? {
				"--cosmic-border-size": borderWidth,
			}
		: {};
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

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!onClick) return;

		// Check if the clicked element is interactive
		const target = e.target as HTMLElement;
		if (isInteractive(target)) {
			return; // Don't fire onClick if clicking an interactive element
		}

		// Fire the onClick handler
		onClick(e);
	};

	// Determine width behavior: use `width` prop if provided, otherwise fall back to `fullWidth` for backward compatibility
	const widthBehavior =
		width ?? (fullWidth ? ("constrained" as const) : ("auto" as const));

	// Build width classes based on behavior
	const getWidthClasses = () => {
		switch (widthBehavior) {
			case "full":
				return "w-full min-w-0"; // min-w-0 allows grid items to shrink properly
			case "auto":
				return "w-auto";
			case "constrained":
				return [
					"mx-auto w-full",
					maxWidthClasses[maxWidth],
					"px-2 sm:px-6 lg:px-8",
				];
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Container may contain nested buttons, so we cannot use <button>. Click handling respects nested interactive elements.
		// biome-ignore lint/a11y/useKeyWithClickEvents: Container is a layout component that may contain nested interactive elements. Keyboard navigation is handled by nested elements.
		<div
			onClick={onClick ? handleClick : undefined}
			style={style}
			className={clsx(
				"flex items-center relative",
				gapClasses[gap],
				getWidthClasses(),
				directionClasses[direction],
				onClick && "cursor-pointer hover:opacity-90 transition-opacity",
				processedClassName,
				...(cosmicBorder ? roundedClasses : []),
			)}
		>
			{cosmicBorder && (
				<div
					aria-hidden
					className={clsx(
						"absolute inset-0 pointer-events-none",
						roundedClasses.join(" "),
						cosmicBorderAnimate && "animate-cosmic-border-shift",
					)}
					style={{
						padding: borderWidth,
						background: `conic-gradient(from var(--cosmic-border-angle), rgba(124,58,237,1), rgba(236,72,153,1), rgba(59,130,246,1), rgba(124,58,237,1))`,
						WebkitMask: `linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)`,
						WebkitMaskComposite: "xor",
						mask: `linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)`,
						maskComposite: "exclude",
						filter: "saturate(140%) brightness(120%)",
					}}
				/>
			)}
			{children}
		</div>
	);
}
