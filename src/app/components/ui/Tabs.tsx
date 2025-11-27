'use client';

import clsx from 'clsx';
import React from 'react';

export type TabsVariant = 'primary' | 'secondary';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Label to display on the tab
   */
  label: React.ReactNode;
  /**
   * Optional icon to display with the label
   */
  icon?: React.ReactNode;
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
}

export interface TabsProps {
  /**
   * Array of tab items to display
   */
  items: TabItem[];
  /**
   * Currently active tab ID
   */
  value: string;
  /**
   * Callback when a tab is selected
   */
  onChange: (value: string) => void;
  /**
   * Visual variant of the tabs
   * @default 'primary'
   */
  variant?: TabsVariant;
  /**
   * Size of the tabs
   * @default 'md'
   */
  size?: TabsSize;
  /**
   * Whether tabs should take full width
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Custom className for the container
   */
  className?: string;
}

const variantStyles: Record<TabsVariant, string> = {
  primary: 'bg-zinc-800/60',
  secondary: 'bg-zinc-900/40',
};

const sizeStyles: Record<TabsSize, string> = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1.5',
};

const tabSizeStyles: Record<TabsSize, string> = {
  sm: 'py-1 text-xs',
  md: 'py-2 text-sm',
  lg: 'py-2.5 text-base',
};

const activeTabStyles: Record<TabsVariant, string> = {
  primary: 'bg-zinc-950 text-white',
  secondary: 'bg-zinc-800 text-white',
};

const inactiveTabStyles: Record<TabsVariant, string> = {
  primary: 'text-zinc-400 hover:text-zinc-200',
  secondary: 'text-zinc-500 hover:text-zinc-300',
};

export function Tabs({
  items,
  value,
  onChange,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className,
}: TabsProps) {
  return (
    <div
      className={clsx(
        'flex rounded-xl',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : 'inline-flex',
        className,
      )}
      role="tablist"
      aria-label="Tabs"
    >
      {items.map((item) => {
        const isActive = value === item.id;
        const isDisabled = item.disabled;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.id}`}
            id={`tab-${item.id}`}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(item.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40',
              tabSizeStyles[size],
              isDisabled && 'opacity-50 cursor-not-allowed',
              !isDisabled &&
                (isActive
                  ? activeTabStyles[variant]
                  : inactiveTabStyles[variant]),
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
