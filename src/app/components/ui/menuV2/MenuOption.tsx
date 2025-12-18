"use client";

import { MenuItem as HeadlessMenuItem } from "@headlessui/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { getLinkProps, isButtonProps, isLinkProps } from "./utils";

type MenuOptionVariants = "primary" | "secondary" | "danger";
type MenuOptionSizes = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props for the MenuOption component
 */
export interface MenuOptionProps {
	/**
	 * Menu item label
	 */
	label?: ReactNode;
	/**
	 * Icon displayed on the left side of the menu item
	 */
	icon?: ReactNode;
	/**
	 * Link href (renders as Next.js Link)
	 * If both href and onClick are provided, href takes precedence
	 */
	href?: string;
	/**
	 * Click handler (renders as button)
	 * Only used if href is not provided
	 */
	onClick?: () => void;
	/**
	 * Whether this item is disabled
	 */
	disabled?: boolean;
	/**
	 * Whether this is a danger item (red styling)
	 */
	danger?: boolean;
	/**
	 * Description text displayed below the label
	 */
	description?: ReactNode;
	/**
	 * Additional CSS classes
	 */
	className?: string;
}

const baseItemStyle =
	"flex items-center justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium text-left transition cursor-pointer";

const variantStyles: Record<MenuOptionVariants, string> = {
	primary: "text-zinc-100 hover:bg-white/10 focus:bg-white/10",
	secondary: "text-zinc-100 hover:bg-zinc-800 focus:bg-zinc-800",
	danger: "text-rose-300 hover:bg-rose-500/20 focus:bg-rose-500/20",
};

const sizeStyles: Record<MenuOptionSizes, string> = {
	xs: "text-xs px-2 py-1.5",
	sm: "text-sm px-3 py-2",
	md: "text-sm px-3 py-2",
	lg: "text-base px-4 py-3",
	xl: "text-lg px-6 py-4",
};

const disabledStyle = "opacity-50 cursor-not-allowed";

/**
 * MenuOption - Menu item component that can render as either a link or button
 *
 * **Link vs Button Behavior:**
 * - If `href` is provided, renders as a Next.js Link
 * - If only `onClick` is provided, renders as a button
 * - If both are provided, `href` takes precedence
 *
 * @example
 * ```tsx
 * // Link item
 * <MenuOption label="Profile" icon={<IoPerson />} href="/profile" />
 *
 * // Button item
 * <MenuOption label="Sign out" onClick={handleSignOut} danger />
 *
 * // With description
 * <MenuOption
 *   label="Projects"
 *   description="View all projects"
 *   icon={<IoFolder />}
 *   href="/dashboard"
 * />
 * ```
 *
 * @param {MenuOptionProps} props - The props for the MenuOption component.
 * @returns {JSX.Element} The rendered MenuOption component.
 */
export function MenuOption({
	label,
	icon,
	href,
	onClick,
	disabled = false,
	danger = false,
	description,
	className,
}: MenuOptionProps) {
	const isDisabled = Boolean(disabled);
	const variant: MenuOptionVariants = danger ? "danger" : "primary";
	const size: MenuOptionSizes = "md";

	const menuItemContent = (
		<>
			{icon && <span className="shrink-0 text-lg">{icon}</span>}
			<div className="flex-1 min-w-0">
				{label && <span className="block font-medium">{label}</span>}
				{description && <span className="block text-xs text-zinc-500 mt-0.5">{description}</span>}
			</div>
		</>
	);

	const linkProps = getLinkProps({ href, onClick });

	if (isLinkProps(linkProps)) {
		return (
			<HeadlessMenuItem
				disabled={isDisabled}
				{...linkProps}
				className={({ focus: isFocused }) =>
					clsx(
						baseItemStyle,
						sizeStyles[size],
						variantStyles[variant],
						isDisabled && disabledStyle,
						isFocused && !isDisabled && variantStyles[variant],
						className,
					)
				}
			>
				{menuItemContent}
			</HeadlessMenuItem>
		);
	}

	if (isButtonProps(linkProps)) {
		return (
			<HeadlessMenuItem
				disabled={isDisabled}
				{...linkProps}
				className={({ focus: isFocused }) =>
					clsx(
						baseItemStyle,
						sizeStyles[size],
						variantStyles[variant],
						isDisabled && disabledStyle,
						isFocused && !isDisabled && variantStyles[variant],
						className,
					)
				}
			>
				{menuItemContent}
			</HeadlessMenuItem>
		);
	}

	// Fallback (should never happen)
	return null;
}
