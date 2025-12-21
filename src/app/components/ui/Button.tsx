"use client";

import clsx from "clsx";
import type React from "react";
import type { IconType } from "react-icons";

import { Spinner, type SpinnerType } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

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
  /**
   * Icon to display (for icon-only buttons)
   */
  icon?: IconType;
  /**
   * Badge count to display in top-right corner
   */
  badgeCount?: number;
  children?: React.ReactNode;
}

const baseStyle =
  "relative overflow-hidden rounded-lg py-2.5 text-sm font-medium text-zinc-100 transition focus:outline-none";

const notificationStyle =
  "relative rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-[length:200%_200%] shadow-lg shadow-fuchsia-700/20",
  secondary: "border border-white/10 bg-transparent",
  danger: "border border-rose-400/40",
  ghost: "border-0 bg-transparent",
};

const variantLoadingStyles: Record<ButtonVariant, string> = {
  primary: "opacity-70 cursor-wait",
  secondary: "",
  danger: "",
  ghost: "",
};

const variantDisabledStyles: Record<ButtonVariant, string> = {
  primary: "opacity-50 cursor-not-allowed shadow-zinc-700/20",
  secondary: "opacity-50 cursor-not-allowed",
  danger: "opacity-50 cursor-not-allowed",
  ghost: "opacity-50 cursor-not-allowed",
};

const variantHoverStyles: Record<ButtonVariant, string> = {
  primary:
    "hover:animate-rotate-gradient focus:shadow-[0_0_0_3px_rgba(255,255,255,0.35),0_10px_25px_-10px_rgba(0,0,0,0.6)]",
  secondary: "hover:bg-white/5",
  danger: "hover:bg-rose-500/20",
  ghost: "hover:bg-white/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "text-xs px-2 py-1",
  sm: "text-sm px-3 py-1",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3",
  xl: "text-lg px-8 py-4",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  stack = false,
  loading = false,
  loadingType = "circular",
  hideChildrenWhenLoading = false,
  icon: Icon,
  badgeCount,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = loading || props.disabled;
  const isNotification = Icon !== undefined;
  const displayBadgeCount =
    badgeCount !== undefined && badgeCount > 0
      ? badgeCount > 99
        ? "99+"
        : badgeCount
      : null;

  // If icon is provided, render as icon button with optional badge
  if (isNotification) {
    return (
      <button
        {...props}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={clsx(
          notificationStyle,
          isDisabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {displayBadgeCount && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {displayBadgeCount}
          </span>
        )}
      </button>
    );
  }

  // Standard button rendering
  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={clsx(
        baseStyle,
        variantStyles[variant ?? "primary"],
        sizeStyles[size ?? "md"],
        fullWidth && "w-full",
        loading && variantLoadingStyles[variant ?? "primary"],
        !loading && isDisabled && variantDisabledStyles[variant ?? "primary"],
        !isDisabled && variantHoverStyles[variant ?? "primary"],
        className,
      )}
    >
      <span
        className={clsx(
          stack ? "flex flex-col items-center" : "inline-flex items-center",
          "gap-2",
        )}
      >
        {hideChildrenWhenLoading && loading ? null : children}
        {loading && (
          <Spinner
            type={loadingType}
            size={size}
            variant={variant === "primary" ? "secondary" : "secondary"}
            colorOverride={
              variant === "primary"
                ? loadingType === "circular"
                  ? "text-white"
                  : "bg-white"
                : undefined
            }
          />
        )}
      </span>
    </button>
  );
}
