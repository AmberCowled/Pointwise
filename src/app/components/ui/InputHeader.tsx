'use client';

import clsx from 'clsx';
import React from 'react';

export interface InputHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  htmlFor?: string;
  label?: React.ReactNode;
  required?: boolean;
  rightSlot?: React.ReactNode;
}

export function InputHeader({
  htmlFor,
  label,
  required,
  rightSlot,
  className,
  ...props
}: InputHeaderProps) {
  const hasLeft = Boolean(label) || Boolean(required);
  const hasRight = Boolean(rightSlot);
  const hasContent = hasLeft || hasRight;

  if (!hasContent) return null;

  const baseClasses =
    'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500';

  const left = (
    <>
      {label ? <span>{label}</span> : null}
      {required ? (
        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-200">
          Required
        </span>
      ) : null}
    </>
  );

  if (htmlFor && label) {
    return (
      <label htmlFor={htmlFor} className={clsx(baseClasses, className)}>
        {left}
        {hasRight ? <span className="ml-auto">{rightSlot}</span> : null}
      </label>
    );
  }

  return (
    <div className={clsx(baseClasses, className)} {...props}>
      {left}
      {hasRight ? <span className="ml-auto">{rightSlot}</span> : null}
    </div>
  );
}
