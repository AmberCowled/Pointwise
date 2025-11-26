'use client';

import { TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

interface ModalOverlayProps {
  /**
   * Custom className for the overlay
   */
  className?: string;
  /**
   * Enter animation duration in milliseconds
   */
  enterDuration: number;
  /**
   * Leave animation duration in milliseconds
   */
  leaveDuration: number;
}

/**
 * ModalOverlay component - handles overlay transition
 * @internal - Used by Modal component
 */
export function ModalOverlay({
  className,
  enterDuration,
  leaveDuration,
}: ModalOverlayProps) {
  return (
    <TransitionChild
      as={Fragment}
      enter="ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={className ?? 'fixed inset-0 bg-zinc-950/80 backdrop-blur-sm'}
        style={
          {
            '--enter-duration': `${enterDuration}ms`,
            '--leave-duration': `${leaveDuration}ms`,
            transitionDuration: 'var(--enter-duration)',
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
    </TransitionChild>
  );
}
