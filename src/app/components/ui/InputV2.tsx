"use client";

import clsx from "clsx";
import type React from "react";
import { forwardRef, useId, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { CharCount } from "./CharCount";
import { InputHeader } from "./InputHeader";
import { ProgressBar } from "./ProgressBar";
import { VisibilityToggle } from "./VisibilityToggle";

type InputVariants = "primary" | "secondary" | "danger";
type InputSizes = "xs" | "sm" | "md" | "lg" | "xl";
type InputFlex = "shrink" | "default" | "grow";

/**
 * Custom props for the InputV2 component
 *
 * These props appear first in IntelliSense autocomplete when using the component.
 * All standard HTML input attributes are also supported.
 */
export interface InputV2CustomProps {
  /**
   * Visual variant style
   * @default 'primary'
   */
  variant?: InputVariants;

  /**
   * Size of the input
   * @default 'md'
   */
  size?: InputSizes;

  /**
   * Flex behavior for the input wrapper
   * - 'shrink': Prevents the input from shrinking (flex-shrink-0)
   * - 'default': Normal flex behavior
   * - 'grow': Input takes up available space (flex-1 min-w-0)
   * @default 'default'
   */
  flex?: InputFlex;

  /**
   * Error state. Can be a boolean to show error styling, or a string to display an error message
   */
  error?: boolean | string;

  /**
   * Label text displayed above the input
   */
  label?: React.ReactNode;

  /**
   * Description text displayed below the input
   */
  description?: React.ReactNode;

  /**
   * Whether to show a password visibility toggle button (only applies when type="password")
   * @default false
   */
  showPasswordToggle?: boolean;

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
   * Callback fired when user submits search (Enter key or button click)
   * Optional - button can be shown without callback for visual consistency
   * @param value - The current input value
   */
  onSearch?: (value: string) => void;

  /**
   * Whether to show the search button on the right side
   * Works independently of `onSearch` - button will appear if `true` even without callback
   * Useful for front-end only implementations where backend will wire up later
   * Button will be disabled (non-functional) if `showSearchButton={true}` but `onSearch` is not provided
   * @default false
   */
  showSearchButton?: boolean;

  /**
   * Default value for the input (uncontrolled component)
   * @default ''
   */
  defaultValue?: string;

  /**
   * Callback fired when the input value changes
   * Receives the new value as a string (not the event)
   * @param value - The new input value
   */
  onChange?: (value: string) => void;
}

/**
 * Props for the InputV2 component
 */
export type InputV2Props = InputV2CustomProps &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "value" | "defaultValue"
  >;

const baseStyle =
  "border text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:outline-none";

const variantStyles: Record<InputVariants, string> = {
  primary: "rounded-2xl border-white/10 bg-white/5",
  secondary: "rounded-lg border-white/10 bg-zinc-900",
  danger: "rounded-2xl border-rose-400/60 bg-rose-500/10",
};

const variantFocusStyles: Record<InputVariants, string> = {
  primary: "focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/40",
  secondary: "focus:border-fuchsia-500/50",
  danger: "focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/40",
};

const variantHoverStyles: Record<InputVariants, string> = {
  primary: "hover:border-white/20",
  secondary: "hover:border-white/15",
  danger: "hover:border-rose-400/70",
};

const sizeStyles: Record<InputSizes, string> = {
  xs: "text-[16px] px-2 py-1.5",
  sm: "text-[16px] px-3 py-2",
  md: "text-[16px] px-4 py-3",
  lg: "text-base px-6 py-3",
  xl: "text-lg px-8 py-4",
};

const disabledStyle = "opacity-50 cursor-not-allowed";

const variantErrorStyles: Record<InputVariants, string> = {
  primary: "border-rose-400/60 focus:border-rose-400/80",
  secondary: "border-rose-400/60 focus:border-rose-400/80",
  danger: "border-rose-500/80 focus:border-rose-500/90",
};

const flexClasses: Record<InputFlex, string> = {
  shrink: "flex-shrink-0",
  default: "",
  grow: "flex-1 min-w-0",
};

const innerWidthClasses: Record<InputFlex, string> = {
  shrink: "w-auto",
  default: "inline-block",
  grow: "w-full",
};

/**
 * InputV2 - Enhanced input component with variants, sizes, and optional features
 *
 * Uncontrolled component that manages its own internal state. Use `onChange` to track value changes
 * in parent components.
 *
 * **Custom Props:**
 * - `variant?: "primary" | "secondary" | "danger"` - Visual style (default: "primary")
 * - `size?: "xs" | "sm" | "md" | "lg" | "xl"` - Input size (default: "md")
 * - `flex?: "shrink" | "default" | "grow"` - Flex behavior (default: "default")
 * - `error?: boolean | string` - Error state or error message
 * - `label?: ReactNode` - Label text above input
 * - `description?: ReactNode` - Description text below input
 * - `defaultValue?: string` - Initial value (default: "")
 * - `onChange?: (value: string) => void` - Callback fired when value changes (receives string, not event)
 * - `showPasswordToggle?: boolean` - Show password visibility toggle (default: false)
 * - `showCharCount?: boolean` - Show character count (default: false, requires maxLength)
 * - `showProgressBar?: boolean` - Show progress bar (default: false, requires maxLength)
 * - `charCountWarningThreshold?: number` - Warning threshold % (default: 70)
 * - `charCountErrorThreshold?: number` - Error threshold % (default: 90)
 * - `onSearch?: (value: string) => void` - Callback fired when user submits search (Enter key or button click)
 * - `showSearchButton?: boolean` - Show search button on the right side (default: false). Works independently of `onSearch` for better DX
 *
 * All standard HTML input attributes (except `onChange`, `value`, `defaultValue`) are also supported.
 *
 * @example
 * ```tsx
 * const [name, setName] = useState("");
 *
 * <InputV2
 *   label="Project Name"
 *   defaultValue=""
 *   onChange={setName}
 * />
 *
 * // With search button
 * <InputV2
 *   placeholder="Search..."
 *   showSearchButton
 *   onSearch={(value) => console.log("Searching:", value)}
 * />
 * ```
 */
const InputV2 = forwardRef<HTMLInputElement, InputV2Props>(function InputV2(
  {
    variant = "primary",
    size = "md",
    flex = "default",
    error,
    label,
    description,
    showPasswordToggle = false,
    showCharCount = false,
    showProgressBar = false,
    charCountWarningThreshold = 70,
    charCountErrorThreshold = 90,
    onSearch,
    showSearchButton = false,
    defaultValue = "",
    onChange,
    className,
    id,
    disabled,
    required,
    type = "text",
    maxLength,
    ...props
  }: InputV2Props,
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorMessage = typeof error === "string" ? error : undefined;

  const shouldShowPassword = showPasswordToggle && type === "password";
  const [showPassword, setShowPassword] = useState(false);

  // Internal state management (uncontrolled component)
  const [internalValue, setInternalValue] = useState(defaultValue);

  const charCount = internalValue.length;
  const maxChars = maxLength ?? 0;
  const shouldShowCharCount = showCharCount && maxChars > 0;
  const shouldShowProgressBar = showProgressBar && maxChars > 0;
  const hasHeader = !!label || !!required || shouldShowCharCount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSearch = () => {
    if (!disabled && onSearch) {
      onSearch(internalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled && onSearch) {
      e.preventDefault();
      handleSearch();
    }
    props.onKeyDown?.(e);
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
            htmlFor={inputId}
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
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={shouldShowPassword && showPassword ? "text" : type}
            disabled={disabled}
            required={required}
            value={internalValue}
            maxLength={maxLength}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={clsx(
              baseStyle,
              variantStyles[variant],
              sizeStyles[size],
              "w-full",
              (showPasswordToggle || showSearchButton) && "pr-10",
              disabled && disabledStyle,
              !disabled && error && variantErrorStyles[variant],
              !disabled && !error && variantFocusStyles[variant],
              !disabled && !error && variantHoverStyles[variant],
              className,
            )}
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
            {showSearchButton && (
              <button
                type="button"
                onClick={handleSearch}
                disabled={disabled || !onSearch}
                className={clsx(
                  "rounded-lg p-1.5 text-zinc-400 transition-all duration-200",
                  "hover:text-zinc-100 hover:bg-white/10 hover:scale-110",
                  "active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
                  (disabled || !onSearch) &&
                    "cursor-not-allowed opacity-50 hover:scale-100 hover:bg-transparent",
                )}
                aria-label="Search"
              >
                <IoSearch className="h-4 w-4" />
              </button>
            )}
            {showPasswordToggle && (
              <VisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            )}
          </div>
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
});

InputV2.displayName = "InputV2";

export default InputV2;
