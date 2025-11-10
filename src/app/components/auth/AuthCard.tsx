import { PropsWithChildren } from 'react';

export default function AuthCard({ children }: PropsWithChildren) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/40">
      {children}
    </div>
  );
}
