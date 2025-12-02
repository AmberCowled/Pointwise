'use client';

import { MenuItem as HeadlessMenuItem } from '@headlessui/react';
import clsx from 'clsx';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { Spinner } from './Spinner';
import {
  baseItemStyle,
  dangerItemStyle,
  disabledItemStyle,
  iconSizeStyles,
  itemVariantStyles,
  selectedItemStyle,
  sizeStyles,
  useMenuContext,
} from './MenuContext';

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
   * Children - custom content for the menu item
   */
  children?: ReactNode;
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
}: MenuItemProps) {
  const menuContext = useMenuContext();
  const { variant, size, itemClassName } = menuContext;

  const isDisabled = Boolean(disabled || loading);
  const isSelected = Boolean(selected);
  const isDanger = Boolean(danger);

  const badgeContent =
    badge ??
    (badgeCount !== undefined && badgeCount > 0 ? (
      <span className="inline-flex items-center justify-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    ) : null);

  // If custom content is provided, use it; otherwise use default layout
  const menuItemContent = children ? (
    children
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
      </div>
    </>
  );

  // Render menu item
  if (href) {
    return (
      <HeadlessMenuItem
        disabled={isDisabled}
        as={Link}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={({ focus: isFocused }) =>
          clsx(
            baseItemStyle,
            sizeStyles[size],
            isSelected && selectedItemStyle,
            !isSelected && itemVariantStyles[variant],
            isDisabled && disabledItemStyle,
            isFocused && !isDisabled && !isSelected && 'bg-white/10',
            itemClassName,
            className,
          )
        }
      >
        {menuItemContent}
      </HeadlessMenuItem>
    );
  }

  return (
    <HeadlessMenuItem
      disabled={isDisabled}
      as="button"
      onClick={onClick}
      className={({ focus: isFocused }) =>
        clsx(
          baseItemStyle,
          sizeStyles[size],
          isSelected && selectedItemStyle,
          !isSelected &&
            (isDanger ? dangerItemStyle : itemVariantStyles[variant]),
          isDisabled && disabledItemStyle,
          isFocused && !isDisabled && !isSelected && 'bg-white/10',
          itemClassName,
          className,
        )
      }
    >
      {menuItemContent}
    </HeadlessMenuItem>
  );
}
