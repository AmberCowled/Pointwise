'use client';

import {
  MenuItem as HeadlessMenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import clsx from 'clsx';
import React, { type ReactNode } from 'react';
import { useMenuContext, variantStyles } from './MenuContext';
import {
  cloneMenuForSubmenu,
  getLinkProps,
  getMenuItemClassName,
  isButtonProps,
  isLinkProps,
} from './utils';
import { useSubmenuHover } from './useSubmenuHover';

interface SubMenuItemProps {
  menuItemContent: ReactNode;
  nestedMenu: React.ReactElement;
  isDisabled: boolean;
  isSelected: boolean;
  isDanger: boolean;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  className?: string;
  submenuPlacement?: 'left' | 'right';
}

export function SubMenuItem({
  menuItemContent,
  nestedMenu,
  isDisabled,
  isSelected,
  isDanger,
  href,
  external,
  onClick,
  className,
  submenuPlacement = 'right',
}: SubMenuItemProps) {
  const menuContext = useMenuContext();
  const { variant, size, itemClassName, maxHeight } = menuContext;

  const { isOpen: isSubmenuOpen, open, close } = useSubmenuHover(150);

  // Clone nested menu with submenu props
  const submenuElement = cloneMenuForSubmenu(nestedMenu);

  // Render the menu item with hover-based submenu using Popover
  const linkProps = getLinkProps({ href, external, onClick });
  const isLink = href !== undefined;

  // Shared className function
  const getButtonClassName = (focus: boolean) =>
    getMenuItemClassName({
      variant,
      size,
      isSelected,
      isDanger: isLink ? false : isDanger,
      isDisabled,
      isFocused: focus || isSubmenuOpen,
      itemClassName,
      className,
    });

  return (
    <HeadlessMenuItem disabled={isDisabled}>
      {() => (
        <Popover>
          <div
            className="relative"
            onMouseEnter={open}
            onMouseLeave={close}
            style={{ overflow: 'visible' }}
          >
            {isLink && isLinkProps(linkProps) ? (
              <PopoverButton
                {...linkProps}
                disabled={isDisabled}
                className={({ focus }: { focus: boolean }) =>
                  getButtonClassName(focus)
                }
              >
                {menuItemContent}
              </PopoverButton>
            ) : isButtonProps(linkProps) ? (
              <PopoverButton
                {...linkProps}
                disabled={isDisabled}
                className={({ focus }: { focus: boolean }) =>
                  getButtonClassName(focus)
                }
              >
                {menuItemContent}
              </PopoverButton>
            ) : null}

            {isSubmenuOpen && (
              <PopoverPanel
                anchor={
                  submenuPlacement === 'right' ? 'right start' : 'left start'
                }
                static
                className={clsx(
                  'rounded-2xl border p-2 text-sm shadow-xl',
                  variantStyles[variant],
                  'min-w-48',
                  'scrollbar-hide',
                  maxHeight,
                  'focus:outline-none',
                  'z-60',
                )}
                style={{
                  [submenuPlacement === 'right' ? 'marginLeft' : 'marginRight']:
                    '0.25rem',
                  overflowY: 'auto',
                  overflowX: 'visible',
                  zIndex: 60,
                }}
                onMouseEnter={open}
                onMouseLeave={close}
              >
                {submenuElement}
              </PopoverPanel>
            )}
          </div>
        </Popover>
      )}
    </HeadlessMenuItem>
  );
}
