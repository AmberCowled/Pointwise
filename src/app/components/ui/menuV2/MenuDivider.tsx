"use client";

import { MenuSeparator } from "@headlessui/react";

/**
 * MenuDivider - Visual separator between menu items or sections
 *
 * A simple visual separator that can be manually added or automatically
 * inserted by MenuContainer between consecutive MenuSection components.
 *
 * @example
 * ```tsx
 * <MenuContainer trigger={<Button>Menu</Button>}>
 *   <MenuSection title="Navigation">
 *     <MenuOption label="Projects" />
 *   </MenuSection>
 *   <MenuDivider />
 *   <MenuSection title="Account">
 *     <MenuOption label="Profile" />
 *   </MenuSection>
 * </MenuContainer>
 * ```
 */
export function MenuDivider() {
  return <MenuSeparator className="my-1 border-t border-white/10" />;
}
