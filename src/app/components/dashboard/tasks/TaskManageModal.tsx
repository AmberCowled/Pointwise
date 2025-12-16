"use client";

import { DateTimeDefaults } from "@pointwise/lib/datetime";
import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../ui/modals";
import { Spinner } from "../../ui/Spinner";
import TaskItem, { getTaskScheduleLabel } from "./TaskItem";
import type { DashboardTask } from "./TaskList";

type DeleteMode = "single" | "all";

type TaskManageModalProps = {
	open: boolean;
	task: DashboardTask | null;
	onClose: () => void;
	onEdit?: (task: DashboardTask, scope: "single" | "series") => Promise<void> | void;
	onDelete?: (task: DashboardTask, mode: DeleteMode) => void;
	onComplete?: (task: DashboardTask) => Promise<void> | void;
	isCompleting?: boolean;
	isEditing?: boolean;
	locale?: string | null;
	timeZone?: string | null;
};

export default function TaskManageModal({
	open,
	task,
	onClose,
	onEdit,
	onDelete,
	onComplete,
	isCompleting = false,
	isEditing = false,
	locale,
	timeZone,
}: TaskManageModalProps) {
	const isRecurring = Boolean(task?.sourceRecurringTaskId);
	const [localBusy, setLocalBusy] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteMode, setDeleteMode] = useState<DeleteMode>("single");
	const activeLocale = locale ?? DateTimeDefaults.locale;
	const activeTimeZone = timeZone ?? DateTimeDefaults.timeZone;

	const handleCompleteClick = async () => {
		if (!task || !onComplete || isCompleting || localBusy) return;
		try {
			setLocalBusy(true);
			await onComplete(task);
			onClose();
		} finally {
			setLocalBusy(false);
		}
	};

	const handleDeleteClick = (mode: DeleteMode) => {
		setDeleteMode(mode);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = () => {
		if (task && onDelete) {
			onDelete(task, deleteMode);
			setShowDeleteConfirm(false);
		}
	};

	const handleDeleteCancel = () => {
		setShowDeleteConfirm(false);
		setDeleteMode("single");
	};

	return (
		<Modal open={open} onClose={onClose} size="fullscreen">
			<ModalHeader
				title="Task details"
				subtitle={task?.category ?? undefined}
				actions={
					<button
						type="button"
						className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-rose-400/60 hover:text-white"
						onClick={onClose}
					>
						Close
					</button>
				}
			/>

			<ModalBody>
				{task ? (
					<div className="space-y-8">
						<div className="pointer-events-none select-none">
							<TaskItem
								task={task}
								showActions={false}
								locale={activeLocale}
								timeZone={activeTimeZone}
							/>
						</div>
						<div className="space-y-3 text-sm text-zinc-300">
							{getTaskScheduleLabel(task, activeLocale, activeTimeZone) ? (
								<div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-indigo-200/80">
									{getTaskScheduleLabel(task, activeLocale, activeTimeZone)}
								</div>
							) : null}
							{task.context ? (
								<div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-5">
									{task.context}
								</div>
							) : null}
							{!task.completed ? (
								<div className="w-full">
									<Button
										variant="primary"
										onClick={handleCompleteClick}
										loading={isCompleting || localBusy}
										disabled={isCompleting || localBusy}
										fullWidth
										size="lg"
									>
										Mark complete
									</Button>
								</div>
							) : (
								<span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
									Completed
								</span>
							)}
						</div>
					</div>
				) : (
					<p className="text-sm text-zinc-400">Select a task to view details.</p>
				)}
			</ModalBody>

			<ModalFooter align="between">
				<div className="text-xs text-zinc-500">
					{task?.category ? <span className="capitalize">{task.category}</span> : null}
				</div>
				<div className="flex items-center gap-3">
					{isRecurring ? (
						<>
							<button
								className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => task && onEdit?.(task, "single")}
								disabled={!task || isEditing}
							>
								{isEditing ? (
									<span className="flex items-center gap-2">
										<Spinner size="sm" />
										Loading...
									</span>
								) : (
									"Edit task"
								)}
							</button>
							<button
								className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => task && onEdit?.(task, "series")}
								disabled={!task || isEditing}
							>
								{isEditing ? (
									<span className="flex items-center gap-2">
										<Spinner size="sm" />
										Loading...
									</span>
								) : (
									"Edit series"
								)}
							</button>
						</>
					) : (
						<button
							className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-indigo-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => task && onEdit?.(task, "single")}
							disabled={!task || isEditing}
						>
							{isEditing ? (
								<span className="flex items-center gap-2">
									<Spinner size="sm" />
									Loading...
								</span>
							) : (
								"Edit task"
							)}
						</button>
					)}
					{isRecurring ? (
						<div className="flex items-center gap-2">
							<button
								className="rounded-full border border-rose-400/40 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
								onClick={() => handleDeleteClick("single")}
								disabled={!task}
							>
								Delete task
							</button>
							<button
								className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/30 hover:text-white"
								onClick={() => handleDeleteClick("all")}
								disabled={!task}
							>
								Delete series
							</button>
						</div>
					) : (
						<button
							className="rounded-full border border-rose-400/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
							onClick={() => handleDeleteClick("single")}
							disabled={!task}
						>
							Delete task
						</button>
					)}
				</div>
			</ModalFooter>

			{/* Delete Confirmation Modal */}
			<Modal open={showDeleteConfirm} onClose={handleDeleteCancel} size="sm" zIndex={60}>
				<ModalHeader
					title={deleteMode === "all" ? "Delete series?" : "Delete task?"}
					subtitle={
						deleteMode === "all"
							? "This will permanently delete all tasks in this series. This action cannot be undone."
							: "This will permanently delete this task. This action cannot be undone."
					}
					showCloseButton
					onClose={handleDeleteCancel}
				/>
				<ModalFooter align="end">
					<button
						className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-400/60 hover:text-white"
						onClick={handleDeleteCancel}
					>
						Cancel
					</button>
					<button
						className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/30 hover:text-white"
						onClick={handleDeleteConfirm}
					>
						Delete
					</button>
				</ModalFooter>
			</Modal>
		</Modal>
	);
}
