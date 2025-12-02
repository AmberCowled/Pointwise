'use client';

import {
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuItems,
  Transition,
} from '@headlessui/react';
import clsx from 'clsx';
import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { IoChevronDown } from 'react-icons/io5';
import {
  MenuContext,
  type MenuContextValue,
  type MenuSize,
  type MenuVariant,
  variantStyles,
} from './MenuContext';
import { formatBadgeCount } from './utils';

/**
 * Menu Component
 *
 * A flexible dropdown menu component built on Headless UI with support for:
 * - Custom triggers or default button
 * - Menu items with icons, badges, descriptions, and shortcuts
 * - Nested submenus with hover-based interaction
 * - Controlled and uncontrolled state
 * - Multiple variants (primary, secondary, danger) and sizes
 * - Sections and dividers for organization
 *
 * @example
 * ```tsx
 * <Menu triggerLabel="User Menu">
 *   <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
 *   <MenuItem label="Settings" icon={<FiSettings />} href="/settings" />
 *   <MenuDivider />
 *   <MenuItem label="Sign out" onClick={handleSignOut} danger />
 * </Menu>
 * ```
 *
 * @example
 * ```tsx
 * // With submenu
 * <Menu triggerLabel="Options">
 *   <MenuItem label="Settings" icon={<FiSettings />}>
 *     <Menu>
 *       <MenuItem label="Account" href="/settings/account" />
 *       <MenuItem label="Preferences" href="/settings/preferences" />
 *     </Menu>
 *   </MenuItem>
 * </Menu>
 * ```
 */
// Menu Props
export interface MenuProps {
  /**
   * Children - MenuItem, MenuDivider, MenuSection components
   */
  children: ReactNode;
  /**
   * Custom trigger button. If not provided, a default button will be rendered.
   */
  trigger?: ReactNode;
  /**
   * Label for the default trigger button
   */
  triggerLabel?: ReactNode;
  /**
   * Badge count for the trigger button
   */
  triggerBadgeCount?: number;
  /**
   * Custom badge for the trigger button
   */
  triggerBadge?: ReactNode;
  /**
   * Variant style
   * @default 'primary'
   */
  variant?: MenuVariant;
  /**
   * Size of menu items
   * @default 'md'
   */
  size?: MenuSize;
  /**
   * Placement of menu dropdown
   * @default 'bottom end'
   */
  placement?: 'top start' | 'top end' | 'bottom start' | 'bottom end';
  /**
   * Whether to render in portal
   * @default true
   */
  portal?: boolean;
  /**
   * Additional className for trigger button
   */
  triggerClassName?: string;
  /**
   * Additional className for menu items container
   */
  itemsClassName?: string;
  /**
   * Additional className for individual menu items
   */
  itemClassName?: string;
  /**
   * Maximum height of menu
   * @default 'max-h-60'
   */
  maxHeight?: string;
  /**
   * Width of menu
   * @default 'w-48'
   */
  width?: string;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Callback when menu closes
   */
  onClose?: () => void;
  /**
   * Internal: Whether this is a submenu
   * @internal
   */
  isSubmenu?: boolean;
}

// Menu Component
export function Menu({
  children,
  trigger,
  triggerLabel,
  triggerBadgeCount,
  triggerBadge,
  variant = 'primary',
  size = 'md',
  placement = 'bottom end',
  portal = true,
  triggerClassName,
  itemsClassName,
  itemClassName,
  maxHeight = 'max-h-60',
  width = 'w-48',
  open: controlledOpen,
  onOpenChange,
  onClose,
  isSubmenu = false,
}: MenuProps) {
  const isControlled = controlledOpen !== undefined;
  const closeRef = useRef<(() => void) | null>(null);
  const openStateRef = useRef<boolean | undefined>(undefined);
  const prevOpenRef = useRef<boolean | undefined>(undefined);

  // Handle controlled state - close menu when controlledOpen becomes false
  useEffect(() => {
    if (isControlled && controlledOpen === false && closeRef.current) {
      closeRef.current();
    }
  }, [controlledOpen, isControlled]);

  // Notify parent of state changes
  useLayoutEffect(() => {
    if (
      openStateRef.current !== undefined &&
      openStateRef.current !== prevOpenRef.current
    ) {
      const wasOpen = prevOpenRef.current;
      const isOpen = openStateRef.current;
      prevOpenRef.current = openStateRef.current;

      if (onOpenChange) {
        onOpenChange(isOpen);
      }

      if (onClose && wasOpen === true && isOpen === false) {
        onClose();
      }
    }
  }, [onOpenChange, onClose]);

  const contextValue: MenuContextValue = {
    variant,
    size,
    width: isSubmenu ? undefined : width, // Remove width constraint for submenus
    maxHeight,
    itemClassName,
    isSubmenu,
  };

  // For submenus, render directly without HeadlessMenu wrapper
  if (isSubmenu) {
    return (
      <MenuContext.Provider value={contextValue}>
        {children}
      </MenuContext.Provider>
    );
  }

  // For regular menus, wrap in HeadlessMenu
  return (
    <MenuContext.Provider value={contextValue}>
      <HeadlessMenu>
        {({ open, close }) => {
          closeRef.current = close;
          openStateRef.current = open;

          const effectiveOpen = isControlled ? controlledOpen : open;

          return (
            <div className="relative">
              {trigger ? (
                <HeadlessMenuButton as={Fragment}>
                  {() => (
                    <div className={clsx(triggerClassName)}>{trigger}</div>
                  )}
                </HeadlessMenuButton>
              ) : (
                <HeadlessMenuButton
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition',
                    'hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    !triggerLabel && 'px-2',
                    triggerClassName,
                  )}
                >
                  {triggerLabel}
                  {!triggerLabel &&
                    triggerBadgeCount === undefined &&
                    !triggerBadge && (
                      <span className="sr-only" aria-label="Open menu">
                        Menu
                      </span>
                    )}
                  {(triggerBadge ||
                    (triggerBadgeCount !== undefined &&
                      triggerBadgeCount > 0)) && (
                    <span className="shrink-0">
                      {triggerBadge ?? (
                        <span className="inline-flex items-center justify-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
                          {formatBadgeCount(triggerBadgeCount!)}
                        </span>
                      )}
                    </span>
                  )}
                  <IoChevronDown
                    className={clsx(
                      'h-4 w-4 text-zinc-400 transition-transform shrink-0',
                      effectiveOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </HeadlessMenuButton>
              )}

              <Transition
                as={Fragment}
                show={effectiveOpen}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <MenuItems
                  anchor={placement}
                  portal={portal}
                  modal={false}
                  className={clsx(
                    'absolute z-50 mt-2 rounded-2xl border p-2 text-sm shadow-xl focus:outline-none',
                    maxHeight,
                    width,
                    variantStyles[variant],
                    itemsClassName,
                  )}
                  style={{ overflowY: 'auto', overflowX: 'visible' }}
                >
                  {children}
                </MenuItems>
              </Transition>
            </div>
          );
        }}
      </HeadlessMenu>
    </MenuContext.Provider>
  );
}
