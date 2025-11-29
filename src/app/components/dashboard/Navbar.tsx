'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavbarProps = {
  initials: string;
  level: number;
  xpRemaining: number;
  progress: number;
  locale?: string;
};

export default function Navbar({
  initials,
  level,
  xpRemaining,
  progress,
  locale,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale ?? 'en-US'),
    [locale],
  );

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/5 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/logo.png"
                alt="Pointwise"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="hidden text-xs uppercase tracking-[0.3em] text-zinc-500 sm:block">
                Pointwise
              </p>
              <p className="hidden text-sm font-medium text-zinc-200 sm:block">
                Productivity Dashboard
              </p>
            </div>
          </div>
          <form className="relative flex-1 min-w-[140px] sm:max-w-xl">
            <input
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-indigo-400/70 focus:bg-zinc-900/80 focus:ring-2 focus:ring-indigo-500/40"
              type="search"
              name="dashboard-search"
              placeholder="Search tasks, notes, or people"
            />
          </form>
          <div className="ml-auto flex shrink-0 sm:flex-1 sm:justify-end">
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                  {initials}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-zinc-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.122l3.71-3.89a.75.75 0 1 1 1.08 1.04l-4.25 4.45a.75.75 0 0 1-1.08 0l-4.25-4.45a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {open ? (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-zinc-900/90 p-2 text-sm text-zinc-200 shadow-xl shadow-black/40">
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Level {level}
            </span>
            <span className="text-sm text-zinc-400">
              {numberFormatter.format(xpRemaining)} XP to next level
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
