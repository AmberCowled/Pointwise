"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export interface BrandHeaderProps {
  /**
   * Whether to render as a link (to dashboard)
   * @default false
   */
  asLink?: boolean;
  /**
   * Size variant
   * @default 'default'
   */
  size?: "small" | "default" | "large";
  /**
   * Alignment
   * @default 'center'
   */
  align?: "left" | "center" | "right";
  /**
   * Additional className
   */
  className?: string;
  /**
   * Whether to show the brand name text
   * @default true
   */
  showText?: boolean;
  /**
   * Custom text to display (overrides default "Pointwise")
   */
  text?: ReactNode;
  /**
   * Whether to show the eyebrow text (small uppercase "Pointwise")
   * Only used in Navbar context
   * @default false
   */
  showEyebrow?: boolean;
}

export default function BrandHeader({
  asLink = false,
  size = "default",
  align = "center",
  className = "",
  showText = true,
  text,
  showEyebrow = false,
}: BrandHeaderProps) {
  const sizeStyles = {
    small: {
      logo: "h-8 w-8 sm:h-10 sm:w-10",
      logoSize: 40,
      text: "text-lg",
      eyebrow: "text-xs",
    },
    default: {
      logo: "h-12 w-12 sm:h-14 sm:w-14",
      logoSize: 56,
      text: "text-2xl",
      eyebrow: "text-xs",
    },
    large: {
      logo: "h-16 w-16 sm:h-20 sm:w-20",
      logoSize: 80,
      text: "text-3xl sm:text-4xl",
      eyebrow: "text-sm",
    },
  };

  const alignStyles = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const styles = sizeStyles[size];
  const content = (
    <div
      className={`flex items-center gap-2 sm:gap-3 ${alignStyles[align]} ${className}`}
    >
      <div className={`relative ${styles.logo} shrink-0`}>
        <Image
          src="/logo.png"
          alt="Pointwise"
          width={styles.logoSize}
          height={styles.logoSize}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div>
          {showEyebrow && (
            <p
              className={`hidden uppercase tracking-[0.3em] text-zinc-500 sm:block ${styles.eyebrow}`}
            >
              Pointwise
            </p>
          )}
          {!showEyebrow && (
            <span
              className={`font-semibold tracking-tight text-zinc-100 ${styles.text}`}
            >
              {text ?? "Pointwise"}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href="/dashboard"
        className="transition-opacity hover:opacity-80"
        aria-label="Go to dashboard"
      >
        {content}
      </Link>
    );
  }

  return <header>{content}</header>;
}
