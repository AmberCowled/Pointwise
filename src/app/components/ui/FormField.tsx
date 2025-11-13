'use client';

import type { PropsWithChildren, ReactNode } from 'react';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type FormFieldProps = PropsWithChildren<{
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  inlineLabel?: boolean;
  className?: string;
  labelClassName?: string;
  bodyClassName?: string;
}>;

export function FormField({
  label,
  description,
  error,
  htmlFor,
  required,
  inlineLabel = false,
  className,
  labelClassName,
  bodyClassName,
  children,
}: FormFieldProps) {
  const labelClasses = classNames(
    inlineLabel
      ? 'flex items-center justify-between text-sm font-medium text-zinc-200'
      : 'block text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500',
    labelClassName,
  );

  return (
    <div className={classNames('space-y-2', className)}>
      {label ? (
        htmlFor ? (
          <label htmlFor={htmlFor} className={labelClasses}>
            <span>{label}</span>
            {required ? (
              <span className="ml-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200">
                Required
              </span>
            ) : null}
          </label>
        ) : (
          <div className={labelClasses}>
            <span>{label}</span>
            {required ? (
              <span className="ml-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200">
                Required
              </span>
            ) : null}
          </div>
        )
      ) : null}
      <div className={classNames('space-y-2', bodyClassName)}>
        {children}
        {description ? (
          <p className="text-xs text-zinc-500">{description}</p>
        ) : null}
        {error ? (
          <p className="text-xs font-medium text-rose-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
