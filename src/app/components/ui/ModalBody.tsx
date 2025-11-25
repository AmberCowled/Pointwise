'use client';

import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

/**
 * Props for ModalBody component
 */
export interface ModalBodyProps extends PropsWithChildren {
  /**
   * Custom className
   */
  className?: string;
}

/**
 * ModalBody component for modal content
 *
 * @example
 * ```tsx
 * <ModalBody>
 *   <p>Modal content goes here</p>
 * </ModalBody>
 * ```
 */
export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={clsx('flex-1 overflow-y-auto px-6 py-8', className)}>
      {children}
    </div>
  );
}
