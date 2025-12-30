"use client";

import type { ReactNode } from "react";
import { MenuContainer, type MenuContainerProps } from "./MenuContainer";
import { MenuDivider } from "./MenuDivider";
import { MenuOption } from "./MenuOption";
import { MenuSection } from "./MenuSection";

/**
 * Props for the Menu component
 */
export interface MenuProps extends MenuContainerProps {
  /**
   * Menu items, sections, and dividers
   */
  children: ReactNode;
}

/**
 * Menu - High-level dropdown menu component with declarative API
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
 * - `Menu.Section` - Groups related menu options
 * - `Menu.Option` - Individual menu option (link or button)
 * - `Menu.Divider` - Visual separator between sections
 *
 * The component automatically adds MenuDivider between consecutive MenuSection components.
 *
 * @example
 * ```tsx
 * import { Button } from "@pointwise/app/components/ui/Button";
 * import Menu from "@pointwise/app/components/ui/menu";
 * import { IoMenu, IoFolder, IoPerson } from "react-icons/io5";
 *
 * <Menu trigger={<Button icon={IoMenu}>Menu</Button>}>
 *   <Menu.Section title="Navigation">
 *     <Menu.Option
 *       label="Projects"
 *       icon={<IoFolder />}
 *       href="/dashboard"
 *     />
 *   </Menu.Section>
 *   <Menu.Section title="Account">
 *     <Menu.Option
 *       label="Profile"
 *       icon={<IoPerson />}
 *       href="/profile"
 *     />
 *   </Menu.Section>
 * </Menu>
 * ```
 *
 * @param {MenuProps} props - The props for the Menu component.
 * @returns {JSX.Element} The rendered Menu component.
 */
function Menu({ trigger, children, ...props }: MenuProps) {
  return (
    <MenuContainer trigger={trigger} {...props}>
      {children}
    </MenuContainer>
  );
}

// Export sub-components for convenience
Menu.Section = MenuSection;
Menu.Option = MenuOption;
Menu.Divider = MenuDivider;

export default Menu;
