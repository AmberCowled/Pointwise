'use client';

import clsx from 'clsx';
import React from 'react';
import { Skeleton, type SkeletonVariant } from './Skeleton';

export interface SkeletonTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of lines to display
   * @default 3
   */
  lines?: number;
  /**
   * Visual variant
   * @default 'primary'
   */
  variant?: SkeletonVariant;
  /**
   * Spacing between lines (CSS value)
   * @default '0.5rem'
   */
  spacing?: string | number;
  /**
   * Width of each line (CSS value or 'full' for 100%)
   * Can be a single value or array for varying widths
   * @default 'full'
   */
  width?: string | number | Array<string | number>;
  /**
   * Height of each line (CSS value)
   * @default '1rem'
   */
  height?: string | number;
  /**
   * Custom animation speed (duration in seconds)
   * @default 1.5
   */
  speed?: number;
}

/**
 * SkeletonText component for text content placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} />
 * <SkeletonText lines={2} width={['80%', '60%']} />
 * ```
 */
export function SkeletonText({
  lines = 3,
  variant = 'primary',
  spacing = '0.5rem',
  width = 'full',
  height = '1rem',
  speed = 1.5,
  className,
  style,
  ...props
}: SkeletonTextProps) {
  const spacingValue = typeof spacing === 'number' ? `${spacing}px` : spacing;

  const getWidth = (index: number): string | number => {
    if (Array.isArray(width)) {
      return width[index] ?? width[width.length - 1] ?? 'full';
    }
    return width;
  };

  return (
    <div
      role="status"
      aria-label="Loading text"
      className={clsx('flex flex-col', className)}
      style={{
        gap: spacingValue,
        ...style,
      }}
      {...props}
    >
      {Array.from({ length: lines }).map((_, index) => {
        const lineWidth = getWidth(index);
        const isLastLine = index === lines - 1;
        // Last line is often shorter
        const finalWidth =
          isLastLine && !Array.isArray(width) && width === 'full'
            ? '75%'
            : lineWidth;

        return (
          <Skeleton
            key={index}
            width={finalWidth}
            height={height}
            variant={variant}
            speed={speed}
          />
        );
      })}
    </div>
  );
}
