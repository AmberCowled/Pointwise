'use client';

import {
  MenuSection as HeadlessMenuSection,
  MenuHeading,
} from '@headlessui/react';
import type { ReactNode } from 'react';

/**
 * MenuSection Component
 *
 * Groups related menu items together with an optional section title.
 * Useful for organizing menu items into logical sections.
 *
 * @example
 * ```tsx
 * <Menu triggerLabel="User Menu">
 *   <MenuSection title="Account">
 *     <MenuItem label="Profile" href="/profile" />
 *     <MenuItem label="Settings" href="/settings" />
 *   </MenuSection>
 *   <MenuSection title="Actions">
 *     <MenuItem label="Sign out" onClick={handleSignOut} danger />
 *   </MenuSection>
 * </Menu>
 * ```
 */
export interface MenuSectionProps {
  /**
   * Optional section title displayed above the items
   */
  title?: ReactNode;
  /**
   * Menu items to display in this section
   */
  children: ReactNode;
}

export function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <HeadlessMenuSection>
      {title && (
        <MenuHeading className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </MenuHeading>
      )}
      {children}
    </HeadlessMenuSection>
  );
}
