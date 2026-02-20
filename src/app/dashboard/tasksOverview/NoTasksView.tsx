"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { IoClipboard } from "react-icons/io5";

export interface NoTasksViewProps {
	/**
	 * Whether the user has write access to the project
	 */
	hasWriteAccess: boolean;
	/**
	 * Callback when "Create Your First Task" button is clicked
	 */
	onCreateClick?: () => void;
}

/**
 * NoTasksView - Empty state component when user has no tasks
 *
 * Displays a friendly message encouraging users with write access to create a task.
 */
export default function NoTasksView({
	hasWriteAccess,
	onCreateClick,
}: NoTasksViewProps) {
	return (
		<div className="text-center py-12">
			<div
				className={`w-16 h-16 mx-auto mb-4 rounded-full ${StyleTheme.Container.BackgroundEmpty} flex items-center justify-center`}
			>
				<IoClipboard className="w-8 h-8 text-zinc-600" aria-hidden="true" />
			</div>
			<h3 className={`text-lg font-semibold ${StyleTheme.Text.Primary} mb-2`}>
				No tasks yet
			</h3>
			{hasWriteAccess ? (
				<>
					<p
						className={`text-sm ${StyleTheme.Text.Secondary} mb-6 max-w-md mx-auto`}
					>
						Create your first task to start organizing your tasks and
						collaborating with your team.
					</p>
					<Button
						variant="secondary"
						size="sm"
						className="rounded-full"
						onClick={onCreateClick}
					>
						Create Your First Task
					</Button>
				</>
			) : (
				<p
					className={`text-sm ${StyleTheme.Text.Secondary} mb-6 max-w-md mx-auto`}
				>
					No tasks found. Request user or admin role to create a task.
				</p>
			)}
		</div>
	);
}
