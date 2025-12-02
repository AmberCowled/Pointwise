import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import type { ReactNode } from 'react';
import {
  baseItemStyle,
  dangerItemStyle,
  disabledItemStyle,
  itemVariantStyles,
  selectedItemStyle,
  sizeStyles,
  type MenuSize,
  type MenuVariant,
} from './MenuContext';
import { Menu } from './Menu';
import type { MenuProps } from './Menu';

/**
 * MenuItem className building
 *
 * Constructs the className string for a menu item based on its state and props.
 */
interface MenuItemClassNameParams {
  variant: MenuVariant;
  size: MenuSize;
  isSelected: boolean;
  isDanger: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  itemClassName?: string;
  className?: string;
}

/**
 * Builds the className string for a menu item
 *
 * Combines base styles, size styles, variant styles, and state-based styles
 * (selected, danger, disabled, focused) into a single className string.
 *
 * @param params - MenuItem styling parameters
 * @returns Combined className string
 */
export function getMenuItemClassName({
  variant,
  size,
  isSelected,
  isDanger,
  isDisabled,
  isFocused,
  itemClassName,
  className,
}: MenuItemClassNameParams): string {
  return clsx(
    baseItemStyle,
    sizeStyles[size],
    isSelected && selectedItemStyle,
    !isSelected && (isDanger ? dangerItemStyle : itemVariantStyles[variant]),
    isDisabled && disabledItemStyle,
    isFocused && !isDisabled && !isSelected && 'bg-white/10',
    itemClassName,
    className,
  );
}

// Badge rendering
/**
 * Formats a badge count, capping at 99+
 * @param count - The count to format
 * @returns Formatted count string
 */
export function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

/**
 * Renders a badge element from either a custom badge or count
 * @param badge - Custom badge ReactNode
 * @param count - Numeric count for default badge
 * @returns Badge element or null
 */
export function renderBadge(badge?: ReactNode, count?: number): ReactNode {
  if (badge) return badge;
  if (count !== undefined && count > 0) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
        {formatBadgeCount(count)}
      </span>
    );
  }
  return null;
}

// Link/Button props handling
/**
 * Parameters for determining link vs button props
 */
interface LinkPropsParams {
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

/**
 * Determines whether to render as a Link or button and returns appropriate props
 *
 * - If `href` is provided, returns Next.js Link props
 * - Otherwise, returns button props with onClick handler
 * - Automatically adds `target` and `rel` for external links
 *
 * @param params - Object with href, external, and onClick
 * @returns Props object for either Link or button component
 */
export function getLinkProps({
  href,
  external,
  onClick,
}: LinkPropsParams):
  | { as: typeof Link; href: string; target?: string; rel?: string }
  | { as: 'button'; onClick?: () => void } {
  if (href) {
    return {
      as: Link,
      href,
      target: external ? '_blank' : undefined,
      rel: external ? 'noopener noreferrer' : undefined,
    };
  }
  return {
    as: 'button' as const,
    onClick,
  };
}

// Type guards for link/button props
/**
 * Type guard to check if props are for a Link component
 * @param props - Props returned from getLinkProps
 * @returns True if props are for a Link
 */
export function isLinkProps(
  props: ReturnType<typeof getLinkProps>,
): props is { as: typeof Link; href: string; target?: string; rel?: string } {
  return 'href' in props && props.as === Link;
}

/**
 * Type guard to check if props are for a button element
 * @param props - Props returned from getLinkProps
 * @returns True if props are for a button
 */
export function isButtonProps(
  props: ReturnType<typeof getLinkProps>,
): props is { as: 'button'; onClick?: () => void } {
  return props.as === 'button';
}

/**
 * Detects if children contain a nested Menu component
 *
 * Scans through React children to find a Menu component, separating it
 * from any other custom content. Used to determine if a MenuItem should
 * render as a SubMenuItem.
 *
 * @param children - React children to scan
 * @returns Object with `hasNestedMenu` flag, the nested `Menu` element (if found),
 *          and any `customContent` (children that aren't the Menu)
 *
 * @example
 * ```tsx
 * const { hasNestedMenu, nestedMenu, customContent } = detectNestedMenu(children);
 * if (hasNestedMenu && nestedMenu) {
 *   return <SubMenuItem nestedMenu={nestedMenu} />;
 * }
 * ```
 */
export function detectNestedMenu(children: ReactNode): {
  hasNestedMenu: boolean;
  nestedMenu?: React.ReactElement;
  customContent: ReactNode;
} {
  const childrenArray = React.Children.toArray(children);
  let nestedMenu: React.ReactElement | undefined;
  let hasNestedMenu = false;

  // Single pass to find nested menu
  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.type === Menu) {
      nestedMenu = child as React.ReactElement;
      hasNestedMenu = true;
      break;
    }
  }

  const customContent = hasNestedMenu
    ? childrenArray.filter(
        (child) => !(React.isValidElement(child) && child.type === Menu),
      )
    : children;

  return { hasNestedMenu, nestedMenu, customContent };
}

/**
 * Clones a Menu element for use as a submenu
 *
 * Removes trigger-related props and sets `isSubmenu: true` to ensure
 * the nested menu renders correctly without its own trigger button.
 *
 * @param menu - The Menu React element to clone
 * @returns Cloned Menu element with submenu-specific props
 */
export function cloneMenuForSubmenu(
  menu: React.ReactElement,
): React.ReactElement {
  return React.cloneElement(menu, {
    isSubmenu: true,
    trigger: undefined,
    triggerLabel: undefined,
    triggerBadge: undefined,
    triggerBadgeCount: undefined,
    width: undefined,
  } as Partial<MenuProps>);
}
