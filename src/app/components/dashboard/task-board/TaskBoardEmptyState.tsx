"use client";

export type TaskBoardEmptyStateProps = {
	selectedDateLabel: string;
	searchQuery?: string;
};

export default function TaskBoardEmptyState({
	selectedDateLabel,
	searchQuery,
}: TaskBoardEmptyStateProps) {
	const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

	if (hasSearchQuery) {
		return (
			<div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
				No tasks found matching{" "}
				<span className="font-medium text-zinc-200">&ldquo;{searchQuery}&rdquo;</span>. Try a
				different search term or clear the search to see all tasks.
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-400">
			No tasks scheduled for <span className="font-medium text-zinc-200">{selectedDateLabel}</span>.
			Add one with <span className="font-medium text-zinc-200">Create Task</span> or set up a
			recurring routine.
		</div>
	);
}
