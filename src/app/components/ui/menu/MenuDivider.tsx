"use client";

import { MenuSeparator } from "@headlessui/react";

/**
 * MenuDivider Component
 *
 * A visual separator between menu items or sections.
 *
 * @example
 * ```tsx
 * <Menu triggerLabel="Menu">
 *   <MenuItem label="Profile" href="/profile" />
 *   <MenuItem label="Settings" href="/settings" />
 *   <MenuDivider />
 *   <MenuItem label="Sign out" onClick={handleSignOut} danger />
 * </Menu>
 * ```
 */
export function MenuDivider() {
  return <MenuSeparator className="my-1 border-t border-white/10" />;
}
