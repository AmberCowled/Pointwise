'use client';

import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { Card } from '@pointwise/app/components/ui/Card';
import clsx from 'clsx';

export type TaskSectionCardProps = PropsWithChildren<{
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  itemCount?: number;
  storageKey?: string;
}>;

export default function TaskSectionCard({
  title,
  eyebrow,
  action,
  className,
  contentClassName,
  children,
  collapsible = false,
  defaultCollapsed = false,
  itemCount = 0,
  storageKey,
}: TaskSectionCardProps) {
  // Initialize state from localStorage if available, otherwise use defaultCollapsed
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (collapsible && storageKey) {
      const stored = localStorage.getItem(
        `task-section-collapsed-${storageKey}`,
      );
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultCollapsed;
  });

  // Save collapsed state to localStorage
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (storageKey) {
      localStorage.setItem(
        `task-section-collapsed-${storageKey}`,
        String(newState),
      );
    }
  };

  // Build title with badge count if collapsed
  const titleWithBadge = (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      {collapsible && isCollapsed && itemCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
          {itemCount}
        </span>
      )}
    </div>
  );

  // Build action buttons (collapse button + custom action)
  const actionButtons = [
    collapsible && (
      <button
        key="collapse"
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? (
          <IoChevronDown className="h-4 w-4" />
        ) : (
          <IoChevronUp className="h-4 w-4" />
        )}
      </button>
    ),
    action,
  ].filter(Boolean);

  return (
    <Card
      as="section"
      variant="secondary"
      title={titleWithBadge}
      label={eyebrow}
      action={actionButtons}
      className={className}
      contentClassName={clsx(
        'transition-all duration-300 ease-in-out',
        isCollapsed && collapsible
          ? 'max-h-0 overflow-hidden opacity-0'
          : 'opacity-100',
        contentClassName,
      )}
    >
      {children}
    </Card>
  );
}
