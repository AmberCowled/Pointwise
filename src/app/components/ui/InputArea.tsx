'use client';

import clsx from 'clsx';
import React, { forwardRef, useId, useState } from 'react';

import { InputHeader } from './InputHeader';
import { CharCount } from './CharCount';
import { ProgressBar } from './ProgressBar';

export type InputAreaVariants = 'primary' | 'secondary' | 'danger';
export type InputAreaSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface InputAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: InputAreaVariants;
  size?: InputAreaSizes;
  fullWidth?: boolean;
  error?: boolean | string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  showCharCount?: boolean;
  showProgressBar?: boolean;
  charCountWarningThreshold?: number;
  charCountErrorThreshold?: number;
  rows?: number;
  resizable?: boolean;
}

const baseStyle =
  'border text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:outline-none resize-none';

const variantStyles: Record<InputAreaVariants, string> = {
  primary: 'rounded-2xl border-white/10 bg-white/5',
  secondary: 'rounded-lg border-white/10 bg-zinc-900',
  danger: 'rounded-2xl border-rose-400/60 bg-rose-500/10',
};

const variantFocusStyles: Record<InputAreaVariants, string> = {
  primary: 'focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/40',
  secondary: 'focus:border-fuchsia-500/50',
  danger: 'focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/40',
};

const variantHoverStyles: Record<InputAreaVariants, string> = {
  primary: 'hover:border-white/20',
  secondary: 'hover:border-white/15',
  danger: 'hover:border-rose-400/70',
};

const sizeStyles: Record<InputAreaSizes, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-3',
  lg: 'text-base px-6 py-3',
  xl: 'text-lg px-8 py-4',
};

const variantDisabledStyles: Record<InputAreaVariants, string> = {
  primary: 'opacity-50 cursor-not-allowed',
  secondary: 'opacity-50 cursor-not-allowed',
  danger: 'opacity-50 cursor-not-allowed',
};

const variantErrorStyles: Record<InputAreaVariants, string> = {
  primary: 'border-rose-400/60 focus:border-rose-400/80',
  secondary: 'border-rose-400/60 focus:border-rose-400/80',
  danger: 'border-rose-500/80 focus:border-rose-500/90',
};

export const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(
  function InputArea(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      error,
      label,
      description,
      showCharCount = false,
      showProgressBar = false,
      charCountWarningThreshold = 70,
      charCountErrorThreshold = 90,
      className,
      id,
      disabled,
      required,
      rows = 4,
      resizable = false,
      value,
      defaultValue,
      maxLength,
      onChange,
      ...props
    }: InputAreaProps,
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorMessage = typeof error === 'string' ? error : undefined;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? ''),
    );

    const textareaValue = isControlled ? String(value ?? '') : internalValue;
    const charCount = textareaValue.length;
    const maxChars = maxLength ?? 0;
    const shouldShowCharCount = showCharCount && maxChars > 0;
    const shouldShowProgressBar = showProgressBar && maxChars > 0;
    const hasHeader = !!label || !!required || shouldShowCharCount;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        <div className={clsx(fullWidth ? 'w-full' : 'inline-block')}>
          {hasHeader && (
            <InputHeader
              htmlFor={textareaId}
              label={label}
              required={required}
              rightSlot={
                shouldShowCharCount && (
                  <CharCount
                    count={charCount}
                    max={maxChars}
                    warningThreshold={charCountWarningThreshold}
                    errorThreshold={charCountErrorThreshold}
                  />
                )
              }
            />
          )}

          <div className="relative mt-1">
            <textarea
              {...props}
              id={textareaId}
              ref={ref}
              rows={rows}
              disabled={disabled}
              required={required}
              {...(isControlled ? { value } : { defaultValue })}
              maxLength={maxLength}
              onChange={handleChange}
              className={clsx(
                baseStyle,
                variantStyles[variant],
                sizeStyles[size],
                'w-full',
                resizable && 'resize-y',
                disabled && variantDisabledStyles[variant],
                !disabled && error && variantErrorStyles[variant],
                !disabled && !error && variantFocusStyles[variant],
                !disabled && !error && variantHoverStyles[variant],
                className,
              )}
            />
          </div>

          {shouldShowProgressBar && (
            <ProgressBar
              className="mt-1"
              value={charCount}
              maxValue={maxChars}
              heightClass="h-1.5"
              overwriteColorClass={(normalisedUsage) =>
                normalisedUsage * maxChars >= charCountErrorThreshold
                  ? 'bg-rose-400'
                  : normalisedUsage * maxChars >= charCountWarningThreshold
                    ? 'bg-amber-400'
                    : 'bg-indigo-400'
              }
            />
          )}
        </div>

        {description && <p className="text-xs text-zinc-500">{description}</p>}

        {errorMessage && (
          <p className="text-xs font-medium text-rose-400">{errorMessage}</p>
        )}
      </div>
    );
  },
);

InputArea.displayName = 'InputArea';
