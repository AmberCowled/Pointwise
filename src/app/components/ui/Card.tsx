'use client';

import clsx from 'clsx';
import React from 'react';

export type CardVariant = 'primary' | 'secondary' | 'danger';

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'div' | 'section' | 'article';
  variant?: CardVariant;
  title?: React.ReactNode;
  label?: React.ReactNode;
  action?: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode;
  responsivePadding?: boolean;
  contentClassName?: string;
}

const baseStyle = 'bg-zinc-900/60 backdrop-blur';

const variantStyles: Record<CardVariant, string> = {
  primary: 'rounded-2xl border border-white/10 shadow-2xl shadow-black/40',
  secondary: 'rounded-3xl border border-white/5',
  danger: 'rounded-2xl border border-rose-400/40 bg-rose-500/10 text-rose-200',
};

export function Card({
  as: Component = 'div',
  variant = 'primary',
  title,
  label,
  action,
  children,
  responsivePadding = false,
  contentClassName,
  className,
  ...props
}: CardProps) {
  const actions = Array.isArray(action) ? action : action ? [action] : [];
  const hasHeader = title || label || actions.length > 0;

  return (
    <Component
      {...props}
      className={clsx(
        baseStyle,
        variantStyles[variant],
        responsivePadding ? 'p-6 sm:p-8' : 'p-6',
        className,
      )}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {label && (
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {label}
              </p>
            )}
            {title && (
              <h2
                className={clsx(
                  'text-xl font-semibold text-zinc-100',
                  label && 'mt-2',
                )}
              >
                {title}
              </h2>
            )}
          </div>
          {actions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions.map((actionItem, index) => (
                <React.Fragment key={index}>{actionItem}</React.Fragment>
              ))}
            </div>
          )}
        </header>
      )}
      <div className={clsx(hasHeader && 'mt-5', contentClassName)}>
        {children}
      </div>
    </Component>
  );
}
