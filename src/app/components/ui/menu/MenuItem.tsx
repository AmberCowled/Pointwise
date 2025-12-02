'use client';

import { MenuItem as HeadlessMenuItem } from '@headlessui/react';
import clsx from 'clsx';
import React, { type ReactNode } from 'react';
import { IoChevronForward, IoChevronBack } from 'react-icons/io5';
import { Spinner } from '../Spinner';
import { iconSizeStyles, useMenuContext } from './MenuContext';
import { SubMenuItem } from './SubMenuItem';
import {
  detectNestedMenu,
  getLinkProps,
  getMenuItemClassName,
  isButtonProps,
  isLinkProps,
  renderBadge,
} from './utils';

export interface MenuItemProps {
  /**
   * Icon to display on the left side of the menu item
   */
  icon?: ReactNode;
  /**
   * Label text for the menu item
   */
  label?: ReactNode;
  /**
   * Badge content to display on the right side
   */
  badge?: ReactNode;
  /**
   * Numeric badge count
   */
  badgeCount?: number;
  /**
   * Whether this item is selected/active
   */
  selected?: boolean;
  /**
   * Whether this item is disabled
   */
  disabled?: boolean;
  /**
   * Whether this item is in a loading state
   */
  loading?: boolean;
  /**
   * Description text displayed below the label
   */
  description?: ReactNode;
  /**
   * Keyboard shortcut to display
   */
  shortcut?: string;
  /**
   * Trailing icon or content
   */
  trailingIcon?: ReactNode;
  /**
   * For button items: onClick handler
   */
  onClick?: () => void;
  /**
   * For link items: href
   */
  href?: string;
  /**
   * For link items: whether to open in new tab
   */
  external?: boolean;
  /**
   * Whether this is a danger item (red styling)
   */
  danger?: boolean;
  /**
   * Custom className for this item
   */
  className?: string;
  /**
   * Children - custom content for the menu item or a nested Menu for submenus
   */
  children?: ReactNode;
  /**
   * Which side the submenu should open to (if this item has a nested Menu)
   * @default 'right'
   */
  submenuPlacement?: 'left' | 'right';
}

export function MenuItem({
  icon,
  label,
  badge,
  badgeCount,
  selected,
  disabled,
  loading,
  description,
  shortcut,
  trailingIcon,
  onClick,
  href,
  external,
  danger,
  className,
  children,
  submenuPlacement = 'right',
}: MenuItemProps) {
  const menuContext = useMenuContext();
  const { variant, size, itemClassName } = menuContext;

  const isDisabled = Boolean(disabled || loading);
  const isSelected = Boolean(selected);
  const isDanger = Boolean(danger);

  // Check if children contains a nested Menu
  const { hasNestedMenu, nestedMenu, customContent } =
    detectNestedMenu(children);

  const badgeContent = renderBadge(badge, badgeCount);

  // If custom content is provided (and no nested menu), use it; otherwise use default layout
  const hasCustomContent = customContent && !hasNestedMenu;
  const menuItemContent = hasCustomContent ? (
    customContent
  ) : (
    <>
      {loading ? (
        <span className={clsx('shrink-0', iconSizeStyles[size])}>
          <Spinner size="sm" variant="primary" />
        </span>
      ) : (
        icon && (
          <span className={clsx('shrink-0', iconSizeStyles[size])}>{icon}</span>
        )
      )}
      <div className="flex-1 min-w-0">
        {label && <span className="block font-medium">{label}</span>}
        {description && (
          <span className="block text-xs text-zinc-500 mt-0.5">
            {description}
          </span>
        )}
      </div>
      <div className="shrink-0 ml-auto flex items-center gap-2">
        {shortcut && (
          <span className="text-xs text-zinc-500 font-mono">{shortcut}</span>
        )}
        {badgeContent && <span>{badgeContent}</span>}
        {trailingIcon && (
          <span className={clsx('shrink-0', iconSizeStyles[size])}>
            {trailingIcon}
          </span>
        )}
        {hasNestedMenu && (
          <span className={clsx('shrink-0', iconSizeStyles[size])}>
            {submenuPlacement === 'right' ? (
              <IoChevronForward className="h-4 w-4 text-zinc-400" />
            ) : (
              <IoChevronBack className="h-4 w-4 text-zinc-400" />
            )}
          </span>
        )}
      </div>
    </>
  );

  // Render submenu item if nested menu exists
  if (hasNestedMenu && nestedMenu) {
    return (
      <SubMenuItem
        menuItemContent={menuItemContent}
        nestedMenu={nestedMenu}
        isDisabled={isDisabled}
        isSelected={isSelected}
        isDanger={isDanger}
        href={href}
        external={external}
        onClick={onClick}
        className={className}
        submenuPlacement={submenuPlacement}
      />
    );
  }

  // Render regular menu item
  const linkProps = getLinkProps({ href, external, onClick });
  const isLink = href !== undefined;

  if (isLink && isLinkProps(linkProps)) {
    return (
      <HeadlessMenuItem
        disabled={isDisabled}
        {...linkProps}
        className={({ focus: isFocused }: { focus: boolean }) =>
          getMenuItemClassName({
            variant,
            size,
            isSelected,
            isDanger: false, // Links don't use danger styling
            isDisabled,
            isFocused,
            itemClassName,
            className,
          })
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
          getMenuItemClassName({
            variant,
            size,
            isSelected,
            isDanger,
            isDisabled,
            isFocused,
            itemClassName,
            className,
          })
        }
      >
        {menuItemContent}
      </HeadlessMenuItem>
    );
  }

  // Fallback (should never happen)
  return null;
}
