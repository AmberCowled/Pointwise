'use client';
import React from 'react';
import GradientButton from '../ui/GradientButton';

type Props = { tab: 'signin' | 'signup' };

export default function AuthForm({ tab }: Props) {
  // You’ll later wire these to server actions or NextAuth credentials if desired.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle sign-in/sign-up
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
      {tab === 'signup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs text-zinc-400 mb-1"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs text-zinc-400 mb-1"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Smith"
              className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs text-zinc-400 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs text-zinc-400 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder={tab === 'signin' ? '••••••••' : 'At least 8 characters'}
          className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-fuchsia-500/50"
          autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
          required
        />
      </div>

      {tab === 'signin' && (
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="accent-fuchsia-500/90" />
            Remember me
          </label>
          <a href="#" className="hover:text-zinc-200">
            Forgot password?
          </a>
        </div>
      )}

      <GradientButton type="submit" loading={false} disabled={false}>
        {tab === 'signin' ? 'Continue' : 'Create account'}
      </GradientButton>
    </form>
  );
}
