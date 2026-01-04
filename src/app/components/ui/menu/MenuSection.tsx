"use client";

import {
	MenuSection as HeadlessMenuSection,
	MenuHeading,
} from "@headlessui/react";
import type { ReactNode } from "react";

/**
 * Props for the MenuSection component
 */
export interface MenuSectionProps {
	/**
	 * Optional section title displayed above the items
	 */
	title?: ReactNode;
	/**
	 * Menu options to display in this section
	 */
	children: ReactNode;
}

/**
 * MenuSection - Groups related menu options together with an optional section title
 *
 * Useful for organizing menu options into logical sections.
 * MenuContainer automatically adds MenuDivider between consecutive MenuSection components.
 *
 * @example
 * ```tsx
 * <MenuContainer trigger={<Button>Menu</Button>}>
 *   <MenuSection title="Navigation">
 *     <MenuOption label="Projects" href="/dashboard" />
 *     <MenuOption label="Tasks" href="/tasks" />
 *   </MenuSection>
 *   <MenuSection title="Account">
 *     <MenuOption label="Profile" href="/profile" />
 *     <MenuOption label="Settings" href="/settings" />
 *   </MenuSection>
 * </MenuSection>
 * ```
 *
 * @param {MenuSectionProps} props - The props for the MenuSection component.
 * @returns {JSX.Element} The rendered MenuSection component.
 */
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
