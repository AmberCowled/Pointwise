import { memo } from 'react';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
      {message}
    </div>
  );
}

export default memo(EmptyState);
