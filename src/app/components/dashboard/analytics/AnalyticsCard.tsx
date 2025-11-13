'use client';

import type { PropsWithChildren, ReactNode } from 'react';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type AnalyticsCardProps = PropsWithChildren<{
  title: ReactNode;
  subtitle: ReactNode;
  controls?: ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export function AnalyticsCard({
  title,
  subtitle,
  controls,
  className,
  contentClassName,
  children,
}: AnalyticsCardProps) {
  return (
    <section
      className={classNames(
        'rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            {subtitle}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">{title}</h2>
        </div>
        {controls ? (
          <div className="flex flex-wrap items-center gap-2">{controls}</div>
        ) : null}
      </div>
      <div className={classNames('mt-6', contentClassName)}>{children}</div>
    </section>
  );
}

export type AnalyticsTabsProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: ReactNode }>;
  onChange: (value: TValue) => void;
  className?: string;
};

export function AnalyticsTabs<TValue extends string>({
  value,
  options,
  onChange,
  className,
}: AnalyticsTabsProps<TValue>) {
  return (
    <div className={classNames('flex flex-wrap items-center gap-2', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={classNames(
              'rounded-full border px-3 py-1 text-sm font-semibold transition',
              isActive
                ? 'border-indigo-400/70 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
                : 'border-white/10 text-zinc-300 hover:border-indigo-400/60 hover:text-white',
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type AnalyticsRangeSelectProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: ReactNode }>;
  onChange: (value: TValue) => void;
  className?: string;
};

export function AnalyticsRangeSelect<TValue extends string>({
  value,
  options,
  onChange,
  className,
}: AnalyticsRangeSelectProps<TValue>) {
  return (
    <div className={classNames('flex flex-wrap items-center gap-2', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={classNames(
              'rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition',
              isActive
                ? 'border-indigo-400/80 bg-indigo-500/20 text-white shadow-inner shadow-indigo-500/30'
                : 'border-white/10 text-zinc-400 hover:border-indigo-400/60 hover:text-white',
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
