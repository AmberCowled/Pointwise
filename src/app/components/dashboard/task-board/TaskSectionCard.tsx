'use client';

import type { PropsWithChildren, ReactNode } from 'react';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type TaskSectionCardProps = PropsWithChildren<{
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export default function TaskSectionCard({
  title,
  eyebrow,
  action,
  className,
  contentClassName,
  children,
}: TaskSectionCardProps) {
  return (
    <section
      className={classNames(
        'rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">{title}</h2>
        </div>
        {action ? (
          <div className="flex items-center gap-2">{action}</div>
        ) : null}
      </div>
      <div className={classNames('mt-5', contentClassName)}>{children}</div>
    </section>
  );
}
