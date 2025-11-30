'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from '@headlessui/react';
import clsx from 'clsx';
import React, { Fragment, useId, useRef, useEffect, useState } from 'react';

import { InputHeader } from './InputHeader';

export type InputSelectVariants = 'primary' | 'secondary' | 'danger';
export type InputSelectSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type InputSelectOption<TValue> = {
  value: TValue;
  label: React.ReactNode;
  description?: React.ReactNode;
  key?: string | number;
  disabled?: boolean;
};

export interface InputSelectProps<TValue> {
  variant?: InputSelectVariants;
  size?: InputSelectSizes;
  fullWidth?: boolean;
  error?: boolean | string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  id?: string;
  value: TValue;
  onChange: (value: TValue) => void;
  options: Array<InputSelectOption<TValue>>;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  renderValue?: (option: InputSelectOption<TValue>) => React.ReactNode;
  by?: (a: TValue, b: TValue) => boolean;
  className?: string;
}

const baseButtonStyle =
  'relative w-full text-left text-zinc-100 shadow-inner shadow-white/5 transition focus:outline-none disabled:cursor-not-allowed';

const variantStyles: Record<InputSelectVariants, string> = {
  primary: 'rounded-2xl border-white/10 bg-white/5',
  secondary: 'rounded-lg border-white/10 bg-zinc-900',
  danger: 'rounded-2xl border-rose-400/60 bg-rose-500/10',
};

const variantFocusStyles: Record<InputSelectVariants, string> = {
  primary: 'focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/40',
  secondary: 'focus:border-fuchsia-500/50',
  danger: 'focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/40',
};

const variantHoverStyles: Record<InputSelectVariants, string> = {
  primary: 'hover:border-white/20',
  secondary: 'hover:border-white/15',
  danger: 'hover:border-rose-400/70',
};

const sizeStyles: Record<InputSelectSizes, string> = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-3',
  lg: 'text-base px-6 py-3',
  xl: 'text-lg px-8 py-4',
};

const disabledStyle = 'opacity-50';

const defaultErrorStyle = 'border-rose-400/60 focus:border-rose-400/80';
const variantErrorStyles: Record<InputSelectVariants, string> = {
  primary: defaultErrorStyle,
  secondary: defaultErrorStyle,
  danger: 'border-rose-500/80 focus:border-rose-500/90',
};

const listBaseStyle =
  'absolute z-10 mt-2 max-h-60 w-full overflow-auto border bg-zinc-900/95 p-2 text-sm shadow-lg focus:outline-none';

const listVariantStyles: Record<InputSelectVariants, string> = {
  primary: 'rounded-2xl border-white/10 shadow-indigo-500/20',
  secondary: 'rounded-lg border-white/10 shadow-fuchsia-500/20',
  danger: 'rounded-2xl border-rose-400/40 shadow-rose-500/20',
};

export function InputSelect<TValue>({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  error,
  label,
  description,
  required,
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  renderValue,
  by,
  className,
}: InputSelectProps<TValue>) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorMessage = typeof error === 'string' ? error : undefined;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const activeOption = options.find((option) =>
    by ? by(option.value, value) : option.value === value,
  );

  const hasHeader = !!label || !!required;

  // Measure button width for dropdown matching and detect mobile
  useEffect(() => {
    if (!buttonRef.current) return;

    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
        setIsMobile(window.innerWidth < 640);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className={clsx(fullWidth ? 'w-full' : 'inline-block')}>
        {hasHeader && (
          <InputHeader htmlFor={selectId} label={label} required={required} />
        )}

        <div className="relative mt-1">
          <Listbox
            value={value}
            onChange={onChange}
            disabled={disabled}
            by={by}
          >
            <ListboxButton
              ref={buttonRef}
              id={selectId}
              className={clsx(
                // Remove w-full if className contains a width class
                className?.match(/\bw-\d+\b/)
                  ? baseButtonStyle.replace('w-full', '').trim()
                  : baseButtonStyle,
                'border',
                variantStyles[variant],
                sizeStyles[size],
                disabled && disabledStyle,
                !!error && variantErrorStyles[variant],
                !disabled && !error && variantFocusStyles[variant],
                !disabled && !error && variantHoverStyles[variant],
                className,
              )}
            >
              <span className="block truncate">
                {activeOption
                  ? renderValue
                    ? renderValue(activeOption)
                    : activeOption.label
                  : (placeholder ?? 'Select...')}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                ▾
              </span>
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions
                anchor="bottom start"
                portal={true}
                className={clsx(listBaseStyle, listVariantStyles[variant])}
                style={
                  buttonWidth
                    ? {
                        width: isMobile ? '100%' : `${buttonWidth}px`,
                      }
                    : { width: '100%' }
                }
              >
                {options.map((option, index) => (
                  <ListboxOption
                    key={option.key ?? index}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ focus, selected, disabled: isDisabled }) =>
                      clsx(
                        'cursor-pointer rounded-xl px-3 py-2 transition text-zinc-100',
                        selected && 'bg-indigo-500/20 text-white',
                        focus && !selected && 'bg-indigo-500/10 text-white',
                        isDisabled && 'cursor-not-allowed opacity-50',
                      )
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      {option.description ? (
                        <span className="text-xs text-zinc-500">
                          {option.description}
                        </span>
                      ) : null}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </Listbox>
        </div>
      </div>

      {description && <p className="text-xs text-zinc-500">{description}</p>}

      {errorMessage && (
        <p className="text-xs font-medium text-rose-400">{errorMessage}</p>
      )}
    </div>
  );
}
