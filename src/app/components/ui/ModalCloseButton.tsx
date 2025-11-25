'use client';

import clsx from 'clsx';

/**
 * Props for ModalCloseButton component
 */
export interface ModalCloseButtonProps {
  /**
   * Callback when close button is clicked
   */
  onClose: () => void;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accessible label for the close button
   * @default 'Close'
   */
  'aria-label'?: string;
}

/**
 * ModalCloseButton component - reusable close button for modals
 *
 * @example
 * ```tsx
 * <ModalCloseButton onClose={() => setIsOpen(false)} />
 * ```
 */
export function ModalCloseButton({
  onClose,
  className,
  size = 'md',
  'aria-label': ariaLabel = 'Close',
}: ModalCloseButtonProps) {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <button
      type="button"
      onClick={onClose}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
        sizeStyles[size],
        className,
      )}
      aria-label={ariaLabel}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
