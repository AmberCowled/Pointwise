'use client';

import { DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';
import { useId } from 'react';

import { ModalCloseButton } from './ModalCloseButton';

/**
 * Props for ModalHeader component
 */
export interface ModalHeaderProps extends PropsWithChildren {
  /**
   * Title of the modal
   */
  title?: ReactNode;
  /**
   * Subtitle or description below the title
   */
  subtitle?: ReactNode;
  /**
   * Action buttons or elements to display on the right side
   */
  actions?: ReactNode;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Whether to show a close button
   * @default false
   */
  showCloseButton?: boolean;
  /**
   * Callback when close button is clicked (required if showCloseButton is true)
   */
  onClose?: () => void;
}

/**
 * ModalHeader component for modal titles and actions
 *
 * @example
 * ```tsx
 * <ModalHeader
 *   title="Edit Task"
 *   subtitle="Make changes to your task"
 *   actions={<Button>Save</Button>}
 *   showCloseButton
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */
export function ModalHeader({
  title,
  subtitle,
  actions,
  className,
  children,
  showCloseButton = false,
  onClose,
}: ModalHeaderProps) {
  const id = useId();
  const titleId = `modal-title-${id}`;

  return (
    <header
      className={clsx(
        'flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4',
        className,
      )}
    >
      <div className="space-y-1 flex-1">
        {title ? (
          <DialogTitle
            id={titleId}
            className="text-lg font-semibold text-zinc-100"
          >
            {title}
          </DialogTitle>
        ) : null}
        {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
        {children}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {showCloseButton && onClose && <ModalCloseButton onClose={onClose} />}
      </div>
    </header>
  );
}
