'use client';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { BsApple } from 'react-icons/bs';

export default function SocialAuthButtons() {
  const continueWithGoogle = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };
  const continueWithApple = () => {
    signIn('apple', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={continueWithGoogle}
        className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800"
      >
        <FcGoogle className="text-2xl mb-1" />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={continueWithApple}
        className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 border border-white/10 py-2 text-sm hover:bg-zinc-800"
      >
        <BsApple className="text-2xl mb-1 text-white" />
        Continue with Apple
      </button>
    </div>
  );
}
