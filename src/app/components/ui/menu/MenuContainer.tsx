"use client";

import {
	Menu as HeadlessMenu,
	MenuButton as HeadlessMenuButton,
	MenuItems,
	Transition,
} from "@headlessui/react";
import clsx from "clsx";
import { Fragment, type ReactNode, useMemo } from "react";
import type { ButtonProps } from "../Button";
import { StyleTheme } from "../StyleTheme";
import { MenuDivider } from "./MenuDivider";
import { MenuSection } from "./MenuSection";

type MenuContainerVariants = "primary" | "secondary" | "danger";
type MenuContainerSizes = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props for the MenuContainer component
 */
export interface MenuContainerProps {
	/**
	 * Menu items, sections, and dividers
	 */
	children: ReactNode;
	/**
	 * Required trigger button - must be Button component
	 */
	trigger: React.ReactElement<ButtonProps>;
	/**
	 * Visual variant style
	 * @default 'primary'
	 */
	variant?: MenuContainerVariants;
	/**
	 * Size of menu items
	 * @default 'md'
	 */
	size?: MenuContainerSizes;
	/**
	 * Placement of menu dropdown
	 * @default 'bottom end'
	 */
	placement?: "top start" | "top end" | "bottom start" | "bottom end";
	/**
	 * Additional CSS classes for the menu container
	 */
	className?: string;
}

const variantStyles: Record<MenuContainerVariants, string> = {
	primary: `${StyleTheme.Container.Border.Primary} ${StyleTheme.Dropdown.Background} ${StyleTheme.Status.Info.shadow}`,
	secondary: `${StyleTheme.Container.Border.Primary} bg-zinc-800 shadow-fuchsia-500/20`,
	danger: `${StyleTheme.Container.Border.Danger} ${StyleTheme.Dropdown.Background} ${StyleTheme.Status.Error.shadow}`,
};

/**
 * MenuContainer - Low-level dropdown menu component with self-managed state
 *
 * **Props:**
 * - `trigger: React.ReactElement<ButtonProps>` - Required Button component trigger
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Menu item size (default: "md")
 * - `placement?: "top start" | "top end" | "bottom start" | "bottom end"` - Dropdown placement (default: "bottom end")
 * - `className?: string` - Additional CSS classes
 *
 * The component automatically adds MenuDivider between consecutive MenuSection components.
 * Dividers are NOT added at the start or end of the menu.
 *
 * @example
 * ```tsx
 * <MenuContainer trigger={<Button icon={IoMenu}>Menu</Button>}>
 *   <MenuSection title="Navigation">
 *     <MenuOption label="Projects" icon={<IoFolder />} href="/dashboard" />
 *   </MenuSection>
 *   <MenuSection title="Account">
 *     <MenuOption label="Profile" icon={<IoPerson />} href="/profile" />
 *   </MenuSection>
 * </MenuContainer>
 * ```
 *
 * @param {MenuContainerProps} props - The props for the MenuContainer component.
 * @returns {JSX.Element} The rendered MenuContainer component.
 */
export function MenuContainer({
	children,
	trigger,
	variant = "primary",
	size: _size = "md", // Currently not used, but kept for API consistency
	placement = "bottom end",
	className,
}: MenuContainerProps) {
	// Auto-add dividers between consecutive MenuSection components
	const processedChildren = useMemo(() => {
		const childrenArray = Array.isArray(children) ? children : [children];
		const result: ReactNode[] = [];
		let prevWasSection = false;

		for (let i = 0; i < childrenArray.length; i++) {
			const child = childrenArray[i];

			// Check if current child is a MenuSection
			if (
				child &&
				typeof child === "object" &&
				"type" in child &&
				child.type === MenuSection
			) {
				// Add divider if previous was also a section (and not at start)
				if (prevWasSection && result.length > 0) {
					result.push(<MenuDivider key={`divider-${i}`} />);
				}
				result.push(child);
				prevWasSection = true;
			} else {
				// Not a section, just add it
				result.push(child);
				prevWasSection = false;
			}
		}

		return result;
	}, [children]);

	return (
		<HeadlessMenu>
			{({ open }) => (
				<div className={clsx("relative", className)}>
					<HeadlessMenuButton as={Fragment}>
						{() => <div>{trigger}</div>}
					</HeadlessMenuButton>

					<Transition
						as={Fragment}
						show={open}
						enter="transition ease-out duration-100"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<MenuItems
							anchor={placement}
							portal={true}
							modal={false}
							className={clsx(
								"absolute z-50 mt-2 rounded-2xl border p-2 text-sm shadow-xl focus:outline-none",
								"max-h-60 w-max min-w-[160px] overflow-auto",
								variantStyles[variant],
							)}
							style={{ overflowY: "auto", overflowX: "visible" }}
						>
							{processedChildren}
						</MenuItems>
					</Transition>
				</div>
			)}
		</HeadlessMenu>
	);
}
