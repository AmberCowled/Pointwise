"use client";

import clsx from "clsx";
import type React from "react";
import type { IconType } from "react-icons";

export type TagVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type TagSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  /**
   * Optional icon to display before the text
   */
  icon?: IconType;
  children: React.ReactNode;
}

const baseStyle =
  "inline-flex items-center font-semibold uppercase tracking-wider rounded-full";

const variantStyles: Record<TagVariant, string> = {
  primary: "bg-indigo-500/10 text-indigo-200",
  secondary: "bg-white/10 text-zinc-300",
  danger: "bg-rose-500/10 text-rose-200",
  success: "bg-emerald-500/10 text-emerald-200",
  warning: "bg-amber-500/10 text-amber-200",
  info: "bg-cyan-500/10 text-cyan-200",
};

const sizeStyles: Record<TagSize, string> = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-3 py-1.5",
  xl: "text-base px-4 py-2",
};

const iconSizeStyles: Record<TagSize, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
};

export function Tag({
  variant = "primary",
  size = "sm",
  icon: Icon,
  children,
  className,
  ...props
}: TagProps) {
  return (
    <span
      className={clsx(
        baseStyle,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={clsx(iconSizeStyles[size], "mr-1.5 shrink-0")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
