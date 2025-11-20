'use client';

import clsx from 'clsx';
import React, { forwardRef, useId } from 'react';

import { InputHeader } from './InputHeader';

export type CheckboxVariants = 'primary' | 'secondary' | 'danger';
export type CheckboxSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  variant?: CheckboxVariants;
  size?: CheckboxSizes;
  error?: boolean | string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
}

const baseStyle =
  'appearance-none cursor-pointer border transition focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed';

const variantStyles: Record<CheckboxVariants, string> = {
  primary:
    'border-white/10 bg-white/5 checked:bg-indigo-500 checked:border-indigo-500',
  secondary:
    'border-white/10 bg-zinc-900 checked:bg-fuchsia-500/20 checked:border-fuchsia-500/50',
  danger:
    'border-rose-400/60 bg-rose-500/10 checked:bg-rose-500 checked:border-rose-500',
};

const variantFocusStyles: Record<CheckboxVariants, string> = {
  primary: 'focus:border-indigo-400/60 focus:ring-indigo-500/40',
  secondary: 'focus:border-fuchsia-500/50 focus:ring-fuchsia-500/30',
  danger: 'focus:border-rose-500/80 focus:ring-rose-500/40',
};

const variantHoverStyles: Record<CheckboxVariants, string> = {
  primary: 'hover:border-white/20',
  secondary: 'hover:border-white/15',
  danger: 'hover:border-rose-400/70',
};

const sizeStyles: Record<CheckboxSizes, string> = {
  xs: 'w-3 h-3 rounded',
  sm: 'w-4 h-4 rounded',
  md: 'w-5 h-5 rounded-md',
  lg: 'w-6 h-6 rounded-md',
  xl: 'w-7 h-7 rounded-lg',
};

const variantDisabledStyles: Record<CheckboxVariants, string> = {
  primary: 'opacity-50',
  secondary: 'opacity-50',
  danger: 'opacity-50',
};

const variantErrorStyles: Record<CheckboxVariants, string> = {
  primary: 'border-rose-400/60 focus:border-rose-400/80 focus:ring-rose-500/40',
  secondary:
    'border-rose-400/60 focus:border-rose-400/80 focus:ring-rose-500/40',
  danger: 'border-rose-500/80 focus:border-rose-500/90 focus:ring-rose-500/50',
};

// Checkmark icon styles based on size
const checkmarkStyles: Record<CheckboxSizes, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      variant = 'primary',
      size = 'md',
      error,
      label,
      description,
      required,
      className,
      id,
      disabled,
      checked,
      defaultChecked,
      ...props
    }: CheckboxProps,
    ref,
  ) {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorMessage = typeof error === 'string' ? error : undefined;
    const hasHeader = !!required && !label;

    return (
      <div className="space-y-2">
        <div className="inline-block">
          {hasHeader && (
            <InputHeader htmlFor={checkboxId} required={required} />
          )}

          <div
            className={clsx(
              'relative flex items-center gap-3',
              hasHeader && 'mt-1',
            )}
          >
            <div className="relative flex items-center justify-center">
              <input
                {...props}
                id={checkboxId}
                ref={ref}
                type="checkbox"
                disabled={disabled}
                required={required}
                checked={checked}
                defaultChecked={defaultChecked}
                className={clsx(
                  baseStyle,
                  'peer',
                  variantStyles[variant],
                  sizeStyles[size],
                  disabled && variantDisabledStyles[variant],
                  !disabled && error && variantErrorStyles[variant],
                  !disabled && !error && variantFocusStyles[variant],
                  !disabled && !error && variantHoverStyles[variant],
                  className,
                )}
              />

              {/* Custom checkmark */}
              <svg
                className={clsx(
                  'absolute pointer-events-none text-white opacity-0 transition-opacity peer-checked:opacity-100',
                  checkmarkStyles[size],
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            {label && (
              <label
                htmlFor={checkboxId}
                className={clsx(
                  'text-sm text-zinc-100 cursor-pointer select-none',
                  disabled && 'opacity-50 cursor-not-allowed',
                  size === 'xs' && 'text-xs',
                  size === 'sm' && 'text-sm',
                  size === 'md' && 'text-sm',
                  size === 'lg' && 'text-base',
                  size === 'xl' && 'text-lg',
                )}
              >
                {label}
              </label>
            )}
          </div>
        </div>

        {description && <p className="text-xs text-zinc-500">{description}</p>}

        {errorMessage && (
          <p className="text-xs font-medium text-rose-400">{errorMessage}</p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
