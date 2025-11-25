'use client';

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Fragment } from 'react';

/**
 * Modal size variants
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/**
 * Props for the Modal component
 */
export interface ModalProps extends PropsWithChildren {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Size of the modal
   * @default 'md'
   */
  size?: ModalSize;
  /**
   * Element to focus when modal opens
   */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /**
   * Custom className for the dialog container
   */
  className?: string;
  /**
   * Custom className for the dialog panel
   */
  panelClassName?: string;
  /**
   * Custom className for the overlay
   */
  overlayClassName?: string;
  /**
   * ID for the modal title (for accessibility)
   */
  titleId?: string;
  /**
   * ID for the modal description (for accessibility)
   */
  descriptionId?: string;
}

/**
 * Modal component - supports both centered and fullscreen modes
 *
 * Use `size="fullscreen"` for fullscreen modals (replaces FullScreenModal).
 *
 * @example
 * ```tsx
 * // Standard centered modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
 *   <ModalHeader title="Example Modal" />
 *   <ModalBody>Content here</ModalBody>
 *   <ModalFooter>Actions here</ModalFooter>
 * </Modal>
 *
 * // Fullscreen modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="fullscreen">
 *   <ModalHeader title="Full Screen Modal" />
 *   <ModalBody>Content here</ModalBody>
 *   <ModalFooter>Actions here</ModalFooter>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  size = 'md',
  initialFocusRef,
  className,
  panelClassName,
  overlayClassName,
  titleId,
  descriptionId,
  children,
}: ModalProps) {
  const isFullscreen = size === 'fullscreen';

  const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    fullscreen: 'max-w-full h-screen',
  };

  // Fullscreen uses different layout and animations
  if (isFullscreen) {
    return (
      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          className={clsx('relative z-50', className)}
          onClose={onClose}
          initialFocus={initialFocusRef}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={
                overlayClassName ??
                'fixed inset-0 bg-zinc-950/80 backdrop-blur-sm'
              }
              aria-hidden="true"
            />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-6"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-6"
              >
                <DialogPanel
                  className={clsx(
                    'relative flex h-screen w-full max-w-full flex-col bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40',
                    panelClassName,
                  )}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                >
                  {children}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  // Standard centered modal
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className={clsx('relative z-50', className)}
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={
              overlayClassName ??
              'fixed inset-0 bg-zinc-950/80 backdrop-blur-sm'
            }
            aria-hidden="true"
          />
        </TransitionChild>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={clsx(
                  'relative w-full transform overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40 transition-all',
                  sizeStyles[size],
                  panelClassName,
                )}
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
