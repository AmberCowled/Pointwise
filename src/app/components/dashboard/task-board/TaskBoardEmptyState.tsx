'use client';

export type TaskBoardEmptyStateProps = {
  selectedDateLabel: string;
};

export default function TaskBoardEmptyState({
  selectedDateLabel,
}: TaskBoardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
      No tasks scheduled for{' '}
      <span className="font-medium text-zinc-200">{selectedDateLabel}</span>.
      Add one with{' '}
      <span className="font-medium text-zinc-200">Create Task</span> or set up a
      recurring routine.
    </div>
  );
}
