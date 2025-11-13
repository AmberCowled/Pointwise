'use client';

import { Dialog, Transition } from '@headlessui/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Fragment } from 'react';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type FullScreenModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  initialFocusRef?: React.MutableRefObject<HTMLElement | null>;
  className?: string;
  panelClassName?: string;
  overlayClassName?: string;
}>;

export function FullScreenModal({
  open,
  onClose,
  initialFocusRef,
  className,
  panelClassName,
  overlayClassName,
  children,
}: FullScreenModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className={classNames('relative z-50', className)}
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
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
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-6"
            >
              <Dialog.Panel
                className={classNames(
                  'relative flex h-screen w-full max-w-full flex-col bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40',
                  panelClassName,
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export type ModalHeaderProps = PropsWithChildren<{
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>;

export function ModalHeader({
  title,
  subtitle,
  actions,
  className,
  children,
}: ModalHeaderProps) {
  return (
    <header
      className={classNames(
        'flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4',
        className,
      )}
    >
      <div className="space-y-1">
        {title ? (
          <Dialog.Title className="text-lg font-semibold text-zinc-100">
            {title}
          </Dialog.Title>
        ) : null}
        {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
        {children}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export type ModalBodyProps = PropsWithChildren<{
  className?: string;
}>;

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={classNames('flex-1 overflow-y-auto px-6 py-8', className)}>
      {children}
    </div>
  );
}

export type ModalFooterProps = PropsWithChildren<{
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between';
}>;

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
      className={classNames(
        'flex flex-wrap items-center gap-3 border-t border-white/10 px-6 py-4',
        alignmentClass,
        className,
      )}
    >
      {children}
    </footer>
  );
}
