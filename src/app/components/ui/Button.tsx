'use client';

import clsx from 'clsx';
import React from 'react';

import { Spinner, type SpinnerType } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  stack?: boolean;
  loading?: boolean;
  /**
   * Type of spinner to display when loading
   * @default 'circular'
   */
  loadingType?: SpinnerType;
  hideChildrenWhenLoading?: boolean;
  children?: React.ReactNode;
}

const baseStyle =
  'relative overflow-hidden rounded-lg py-2.5 text-sm font-medium text-zinc-100 transition focus:outline-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-[length:200%_200%] shadow-lg shadow-fuchsia-700/20',
  secondary: 'border border-white/10 bg-transparent',
  danger: 'border border-rose-400/40',
  ghost: 'border-0 bg-transparent',
};

const variantLoadingStyles: Record<ButtonVariant, string> = {
  primary: 'opacity-70 cursor-wait',
  secondary: '',
  danger: '',
  ghost: '',
};

const variantDisabledStyles: Record<ButtonVariant, string> = {
  primary: 'opacity-50 cursor-not-allowed shadow-zinc-700/20',
  secondary: 'opacity-50 cursor-not-allowed',
  danger: 'opacity-50 cursor-not-allowed',
  ghost: 'opacity-50 cursor-not-allowed',
};

const variantHoverStyles: Record<ButtonVariant, string> = {
  primary:
    'hover:animate-rotate-gradient focus:shadow-[0_0_0_3px_rgba(255,255,255,0.35),0_10px_25px_-10px_rgba(0,0,0,0.6)]',
  secondary: 'hover:bg-white/5',
  danger: 'hover:bg-rose-500/20',
  ghost: 'hover:bg-white/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
  xl: 'text-lg px-8 py-4',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  stack = false,
  loading = false,
  loadingType = 'circular',
  hideChildrenWhenLoading = false,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = loading || props.disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={clsx(
        baseStyle,
        variantStyles[variant ?? 'primary'],
        sizeStyles[size ?? 'md'],
        fullWidth && 'w-full',
        loading && variantLoadingStyles[variant ?? 'primary'],
        !loading && isDisabled && variantDisabledStyles[variant ?? 'primary'],
        !isDisabled && variantHoverStyles[variant ?? 'primary'],
        className,
      )}
    >
      <span
        className={clsx(
          stack ? 'flex flex-col items-center' : 'inline-flex items-center',
          'gap-2',
        )}
      >
        {hideChildrenWhenLoading && loading ? null : children}
        {loading && (
          <Spinner
            type={loadingType}
            size={size}
            variant={variant === 'primary' ? 'secondary' : 'secondary'}
            colorOverride={
              variant === 'primary'
                ? loadingType === 'circular'
                  ? 'text-white'
                  : 'bg-white'
                : undefined
            }
          />
        )}
      </span>
    </button>
  );
}
