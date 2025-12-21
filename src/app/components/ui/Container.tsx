import clsx from "clsx";
import type { ReactNode } from "react";

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
   * Whether the container should take full width with max-width constraints
   * - `true`: Container takes full width with max-width, auto margins, and padding
   * - `false`: Container only takes width of its content (w-auto)
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Click handler for the container
   * Only fires when clicking non-interactive areas (respects nested Links/Buttons)
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
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
 * - `onClick?: (e: React.MouseEvent<HTMLDivElement>) => void` - Click handler (only fires on non-interactive areas)
 *
 * When `fullWidth={true}`, the container applies:
 * - Full width (`w-full`)
 * - Centered with auto margins (`mx-auto`)
 * - Maximum width constraint based on `maxWidth` prop
 * - Responsive horizontal padding (`px-2 sm:px-6 lg:px-8`)
 *
 * When `fullWidth={false}`, the container only takes the width of its content.
 *
 * When `onClick` is provided, the container becomes visually clickable (cursor-pointer, hover effects)
 * but respects nested interactive elements (Links, Buttons, etc.).
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
 *
 * // Clickable container (respects nested Links/Buttons)
 * <Container onClick={() => openModal()}>
 *   <Link href="/details">Details</Link>
 *   <Button onClick={handleSettings}>Settings</Button>
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
  onClick,
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

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Container may contain nested buttons, so we cannot use <button>. Click handling respects nested interactive elements.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Container is a layout component that may contain nested interactive elements. Keyboard navigation is handled by nested elements.
    <div
      onClick={onClick ? handleClick : undefined}
      className={clsx(
        "flex items-center",
        gapClasses[gap],
        fullWidth
          ? [
              "mx-auto w-full",
              maxWidthClasses[maxWidth],
              "px-2 sm:px-6 lg:px-8",
            ]
          : "w-auto",
        directionClasses[direction],
        onClick && "cursor-pointer hover:opacity-90 transition-opacity",
        className,
      )}
    >
      {children}
    </div>
  );
}
