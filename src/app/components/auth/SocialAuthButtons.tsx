'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function SocialAuthButtons() {
  const [pending, setPending] = useState<'google' | 'github' | null>(null);

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '');

  const handle = (provider: 'google' | 'github') => {
    if (!baseUrl) return;
    setPending(provider);
    signIn(provider, { callbackUrl: `${baseUrl}/dashboard` }).finally(() =>
      setPending(null),
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => handle('google')}
        disabled={!!pending}
        className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-busy={pending === 'google'}
      >
        <FcGoogle className="text-2xl mb-1" />
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => handle('github')}
        disabled={!!pending}
        className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-busy={pending === 'github'}
      >
        <FaGithub className="text-2xl mb-1 text-white" />
        Continue with GitHub
      </button>
    </div>
  );
}
