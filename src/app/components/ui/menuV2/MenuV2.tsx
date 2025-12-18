"use client";

import type { ReactNode } from "react";
import { MenuContainer, type MenuContainerProps } from "./MenuContainer";
import { MenuDivider } from "./MenuDivider";
import { MenuOption } from "./MenuOption";
import { MenuSection } from "./MenuSection";

/**
 * Props for the MenuV2 component
 */
export interface MenuV2Props extends MenuContainerProps {
	/**
	 * Menu items, sections, and dividers
	 */
	children: ReactNode;
}

/**
 * MenuV2 - High-level dropdown menu component with declarative API
 *
 * A convenient wrapper around MenuContainer that provides sub-components
 * as static properties for a cleaner developer experience.
 *
 * **Props:**
 * - `trigger: React.ReactElement<ButtonProps>` - Required Button component trigger
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Menu item size (default: "md")
 * - `placement?: "top start" | "top end" | "bottom start" | "bottom end"` - Dropdown placement (default: "bottom end")
 * - `className?: string` - Additional CSS classes
 *
 * **Sub-components:**
 * - `MenuV2.Section` - Groups related menu options
 * - `MenuV2.Option` - Individual menu option (link or button)
 * - `MenuV2.Divider` - Visual separator between sections
 *
 * The component automatically adds MenuDivider between consecutive MenuSection components.
 *
 * @example
 * ```tsx
 * import { Button } from "@pointwise/app/components/ui/Button";
 * import MenuV2 from "@pointwise/app/components/ui/menuV2";
 * import { IoMenu, IoFolder, IoPerson } from "react-icons/io5";
 *
 * <MenuV2 trigger={<Button icon={IoMenu}>Menu</Button>}>
 *   <MenuV2.Section title="Navigation">
 *     <MenuV2.Option
 *       label="Projects"
 *       icon={<IoFolder />}
 *       href="/dashboard"
 *     />
 *   </MenuV2.Section>
 *   <MenuV2.Section title="Account">
 *     <MenuV2.Option
 *       label="Profile"
 *       icon={<IoPerson />}
 *       href="/profile"
 *     />
 *   </MenuV2.Section>
 * </MenuV2>
 * ```
 *
 * @param {MenuV2Props} props - The props for the MenuV2 component.
 * @returns {JSX.Element} The rendered MenuV2 component.
 */
function MenuV2({ trigger, children, ...props }: MenuV2Props) {
	return (
		<MenuContainer trigger={trigger} {...props}>
			{children}
		</MenuContainer>
	);
}

// Export sub-components for convenience
MenuV2.Section = MenuSection;
MenuV2.Option = MenuOption;
MenuV2.Divider = MenuDivider;

export default MenuV2;
