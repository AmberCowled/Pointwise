'use client';

import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

/**
 * Props for ModalFooter component
 */
export interface ModalFooterProps extends PropsWithChildren {
  /**
   * Custom className
   */
  className?: string;
  /**
   * Alignment of footer content
   * @default 'between'
   */
  align?: 'start' | 'center' | 'end' | 'between';
}

/**
 * ModalFooter component for modal actions
 *
 * @example
 * ```tsx
 * <ModalFooter align="end">
 *   <Button variant="secondary" onClick={onCancel}>Cancel</Button>
 *   <Button variant="primary" onClick={onSave}>Save</Button>
 * </ModalFooter>
 * ```
 */
export function ModalFooter({
  children,
  className,
  align = 'between',
}: ModalFooterProps) {
  const alignmentClass =
    align === 'start'
      ? 'justify-start'
      : align === 'center'
        ? 'justify-center'
        : align === 'end'
          ? 'justify-end'
          : 'justify-between';

  return (
    <footer
      className={clsx(
        'flex flex-wrap items-center gap-3 border-t border-white/10 px-6 py-4',
        alignmentClass,
        className,
      )}
    >
      {children}
    </footer>
  );
}
