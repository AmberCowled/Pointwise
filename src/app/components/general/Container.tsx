import clsx from "clsx";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  direction?: "vertical" | "horizontal";
  fullWidth?: boolean;
}

export default function Container({ 
  children, 
  className, 
  maxWidth = "6xl", 
  direction = "horizontal", 
  fullWidth = true,
  gap = "md"
}: ContainerProps) {
  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "6xl": "sm:max-w-6xl",
  };

  const directionClasses = {
    vertical: "flex-col",
    horizontal: "flex-row",
  };

  const gapClasses = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div className={clsx(
      "flex items-center",
      gapClasses[gap],
      fullWidth ? [
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        "px-2 sm:px-6 lg:px-8",
      ] : "w-auto",
      directionClasses[direction],
      className
    )}>
      {children}
    </div>
  );
}