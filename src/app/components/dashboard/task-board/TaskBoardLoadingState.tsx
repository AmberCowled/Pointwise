'use client';

import { Spinner } from '@pointwise/app/components/ui/Spinner';

export default function TaskBoardLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-zinc-400">
      <Spinner size="md" className="mb-3" />
      <span>Loading schedule…</span>
    </div>
  );
}
