"use client";

import clsx from "clsx";
import type React from "react";
import { forwardRef, useId, useState } from "react";
import { CharCount } from "./CharCount";
import { InputHeader } from "./InputHeader";
import { ProgressBar } from "./ProgressBar";

type InputAreaFlex = "shrink" | "default" | "grow";
type InputAreaVariants = "primary" | "secondary" | "danger";
type InputAreaSizes = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Props for the InputAreaV2 component
 */
export interface InputAreaV2Props
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "onChange" | "value" | "defaultValue"
  > {
  /**
   * Visual variant style
   * @default 'primary'
   */
  variant?: InputAreaVariants;

  /**
   * Size of the textarea
   * @default 'md'
   */
  size?: InputAreaSizes;

  /**
   * Flex behavior for the textarea wrapper
   * - 'shrink': Prevents the textarea from shrinking (flex-shrink-0)
   * - 'default': Normal flex behavior
   * - 'grow': Textarea takes up available space (flex-1 min-w-0)
   * @default 'default'
   */
  flex?: InputAreaFlex;

  /**
   * Error state. Can be a boolean to show error styling, or a string to display an error message
   */
  error?: boolean | string;

  /**
   * Label text displayed above the textarea
   */
  label?: React.ReactNode;

  /**
   * Description text displayed below the textarea
   */
  description?: React.ReactNode;

  /**
   * Whether the textarea is required
   */
  required?: boolean;

  /**
   * Whether to show character count indicator (requires maxLength to be set)
   * @default false
   */
  showCharCount?: boolean;

  /**
   * Whether to show a progress bar indicating character usage (requires maxLength to be set)
   * @default false
   */
  showProgressBar?: boolean;

  /**
   * Percentage threshold at which the character count shows a warning (amber color)
   * @default 70
   */
  charCountWarningThreshold?: number;

  /**
   * Percentage threshold at which the character count shows an error (red color)
   * @default 90
   */
  charCountErrorThreshold?: number;

  /**
   * Number of visible text rows
   * @default 4
   */
  rows?: number;

  /**
   * Whether the textarea is resizable
   * @default false
   */
  resizable?: boolean;

  /**
   * Default value for the textarea (uncontrolled component)
   * @default ''
   */
  defaultValue?: string;

  /**
   * Callback fired when the textarea value changes
   * Receives the new value as a string (not the event)
   * @param value - The new textarea value
   */
  onChange?: (value: string) => void;
}

const baseStyle =
  "border text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:outline-none resize-none";

const variantStyles: Record<InputAreaVariants, string> = {
  primary: "rounded-2xl border-white/10 bg-white/5",
  secondary: "rounded-lg border-white/10 bg-zinc-900",
  danger: "rounded-2xl border-rose-400/60 bg-rose-500/10",
};

const variantFocusStyles: Record<InputAreaVariants, string> = {
  primary: "focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/40",
  secondary: "focus:border-fuchsia-500/50",
  danger: "focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/40",
};

const variantHoverStyles: Record<InputAreaVariants, string> = {
  primary: "hover:border-white/20",
  secondary: "hover:border-white/15",
  danger: "hover:border-rose-400/70",
};

const sizeStyles: Record<InputAreaSizes, string> = {
  xs: "text-[16px] px-2 py-1.5",
  sm: "text-[16px] px-3 py-2",
  md: "text-[16px] px-4 py-3",
  lg: "text-base px-6 py-3",
  xl: "text-lg px-8 py-4",
};

const variantDisabledStyles: Record<InputAreaVariants, string> = {
  primary: "opacity-50 cursor-not-allowed",
  secondary: "opacity-50 cursor-not-allowed",
  danger: "opacity-50 cursor-not-allowed",
};

const variantErrorStyles: Record<InputAreaVariants, string> = {
  primary: "border-rose-400/60 focus:border-rose-400/80",
  secondary: "border-rose-400/60 focus:border-rose-400/80",
  danger: "border-rose-500/80 focus:border-rose-500/90",
};

const flexClasses: Record<InputAreaFlex, string> = {
  shrink: "flex-shrink-0",
  default: "",
  grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<InputAreaFlex, string> = {
  shrink: "w-auto",
  default: "inline-block",
  grow: "w-full",
};

/**
 * InputAreaV2 - Enhanced textarea component with variants, sizes, and optional features
 *
 * Uncontrolled component that manages its own internal state. Use `onChange` to track value changes
 * in parent components.
 *
 * **Props:**
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Textarea size (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `error?: boolean | string` - Error state or error message
 * - `label?: ReactNode` - Label text above textarea
 * - `description?: ReactNode` - Description text below textarea
 * - `required?: boolean` - Whether the textarea is required
 * - `defaultValue?: string` - Initial value (default: "")
 * - `onChange?: (value: string) => void` - Callback fired when value changes (receives string, not event)
 * - `showCharCount?: boolean` - Show character count (default: false, requires maxLength)
 * - `showProgressBar?: boolean` - Show progress bar (default: false, requires maxLength)
 * - `charCountWarningThreshold?: number` - Warning threshold % (default: 70)
 * - `charCountErrorThreshold?: number` - Error threshold % (default: 90)
 * - `rows?: number` - Number of visible rows (default: 4)
 * - `resizable?: boolean` - Whether textarea is resizable (default: false)
 *
 * All standard HTML textarea attributes (except `onChange`, `value`, `defaultValue`, `size`) are also supported.
 *
 * @example
 * ```tsx
 * const [description, setDescription] = useState("");
 *
 * <InputAreaV2
 *   label="Description"
 *   defaultValue=""
 *   onChange={setDescription}
 *   flex="grow"
 * />
 * ```
 */
const InputAreaV2 = forwardRef<HTMLTextAreaElement, InputAreaV2Props>(
  function InputAreaV2(
    {
      variant = "primary",
      size = "md",
      flex = "default",
      error,
      label,
      description,
      required,
      showCharCount = false,
      showProgressBar = false,
      charCountWarningThreshold = 70,
      charCountErrorThreshold = 90,
      rows = 4,
      resizable = false,
      defaultValue = "",
      onChange,
      className,
      id,
      disabled,
      maxLength,
      ...props
    }: InputAreaV2Props,
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorMessage = typeof error === "string" ? error : undefined;

    // Internal state management (uncontrolled component)
    const [internalValue, setInternalValue] = useState(defaultValue);

    const charCount = internalValue.length;
    const maxChars = maxLength ?? 0;
    const shouldShowCharCount = showCharCount && maxChars > 0;
    const shouldShowProgressBar = showProgressBar && maxChars > 0;
    const hasHeader = !!label || !!required || shouldShowCharCount;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const getProgressBarColor = (normalisedUsage: number) => {
      if (normalisedUsage * maxChars >= charCountErrorThreshold)
        return "bg-rose-400";
      if (normalisedUsage * maxChars >= charCountWarningThreshold)
        return "bg-amber-400";
      return "bg-indigo-400";
    };

    return (
      <div className={clsx("space-y-2", flexClasses[flex])}>
        <div className={innerWidthClasses[flex]}>
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
              value={internalValue}
              maxLength={maxLength}
              onChange={handleChange}
              className={clsx(
                baseStyle,
                variantStyles[variant],
                sizeStyles[size],
                "w-full",
                resizable && "resize-y",
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
              overwriteColorClass={getProgressBarColor}
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

InputAreaV2.displayName = "InputAreaV2";

export default InputAreaV2;
