'use client';

import { createContext, useContext } from 'react';

export type MenuVariant = 'primary' | 'secondary' | 'danger';
export type MenuSize = 'sm' | 'md' | 'lg';

// Menu Context to pass props to nested menus
export interface MenuContextValue {
  variant: MenuVariant;
  size: MenuSize;
  width?: string;
  maxHeight: string;
  itemClassName?: string;
  isSubmenu?: boolean;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('MenuItem must be used inside a Menu component');
  }
  return context;
};

// Shared style constants
export const variantStyles: Record<MenuVariant, string> = {
  primary: 'border-white/10 bg-zinc-900/90 shadow-indigo-500/20',
  secondary: 'border-white/10 bg-zinc-800/90 shadow-fuchsia-500/20',
  danger: 'border-rose-400/40 bg-zinc-900/90 shadow-rose-500/20',
};

export const sizeStyles: Record<MenuSize, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-3 py-2',
  lg: 'text-base px-4 py-2.5',
};

export const iconSizeStyles: Record<MenuSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const selectedItemStyle =
  'bg-indigo-500/20 text-white border-l-2 border-indigo-400/80';

export const baseItemStyle =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition cursor-pointer';

export const itemVariantStyles: Record<MenuVariant, string> = {
  primary: 'text-zinc-200 hover:bg-white/10 hover:text-white',
  secondary: 'text-zinc-300 hover:bg-white/10 hover:text-white',
  danger: 'text-zinc-200 hover:bg-white/10 hover:text-white',
};

export const dangerItemStyle =
  'text-rose-200 hover:bg-rose-500/20 hover:text-white';

export const disabledItemStyle = 'cursor-not-allowed opacity-50';
