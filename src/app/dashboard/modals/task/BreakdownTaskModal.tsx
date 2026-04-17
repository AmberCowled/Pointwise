"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import {
	useCreateTaskMutation,
	useDeleteTaskMutation,
} from "@pointwise/generated/api";
import { invalidateTags } from "@pointwise/generated/invalidation";
import { apiClient } from "@pointwise/lib/api/client";
import { localToUTC } from "@pointwise/lib/api/date-time";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	CUSTOM_CATEGORY_LABEL,
	getCategoryColor,
	isCoreTaskCategory,
} from "@pointwise/lib/categories";
import { useAppDispatch } from "@pointwise/lib/redux/hooks";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { TaskBreakdownResponse } from "@pointwise/lib/validation/task-generation-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useRef, useState } from "react";
import { IoChevronDown, IoChevronUp, IoCloseOutline } from "react-icons/io5";
import TaskForm, { XpMode } from "./TaskForm";

interface SubtaskFormState {
	title: string;
	description: string;
	category: string;
	customCategory: string;
	xpMode: XpMode;
	xpAward: number;
	startDate: Date | null;
	startTime: string | null;
	dueDate: Date | null;
	dueTime: string | null;
	optional: boolean;
}

export interface BreakdownTaskModalProps {
	task: Task;
	project: Project;
}

type LoadingState = "idle" | "breaking" | "creating";

export default function BreakdownTaskModal({
	task,
	project,
}: BreakdownTaskModalProps) {
	const modalId = `breakdown-task-modal-${task.id}`;
	const goal = project.goal ?? null;
	const dispatch = useAppDispatch();

	const [subtasks, setSubtasks] = useState<SubtaskFormState[]>([]);
	const [loadingState, setLoadingState] = useState<LoadingState>("idle");
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
	const hasFiredRef = useRef(false);

	const { showNotification } = useNotifications();
	const [createTask] = useCreateTaskMutation();
	const [deleteTask] = useDeleteTaskMutation();

	const isLoading = loadingState !== "idle";

	const loadingMessage =
		loadingState === "breaking"
			? "Breaking down task..."
			: loadingState === "creating"
				? "Creating subtasks..."
				: undefined;

	// ── Parse original task dates for pre-population ──

	const parseOriginalDate = (
		dateStr: string | null | undefined,
	): Date | null => {
		if (!dateStr) return null;
		const d = new Date(dateStr);
		return Number.isNaN(d.getTime()) ? null : d;
	};

	const originalStartDate = parseOriginalDate(task.startDate);
	const originalDueDate = parseOriginalDate(task.dueDate);
	const originalStartTime =
		task.hasStartTime && task.startDate
			? new Date(task.startDate).toTimeString().slice(0, 5)
			: null;
	const originalDueTime =
		task.hasDueTime && task.dueDate
			? new Date(task.dueDate).toTimeString().slice(0, 5)
			: null;

	// ── Generate breakdown on modal open ──

	const handleBreakdown = async () => {
		if (hasFiredRef.current) return;
		hasFiredRef.current = true;
		setLoadingState("breaking");
		try {
			const res = await apiClient.post<TaskBreakdownResponse>(
				"/api/llm/task-breakdown",
				{
					projectId: project.id,
					goal,
					title: task.title,
					description: task.description || undefined,
				},
			);

			if (res.subtasks && res.subtasks.length > 0) {
				const formStates: SubtaskFormState[] = res.subtasks.map((st) => {
					const isCore = isCoreTaskCategory(st.category);
					return {
						title: st.title,
						description: st.description,
						category: isCore ? st.category : CUSTOM_CATEGORY_LABEL,
						customCategory: isCore ? "" : st.category,
						xpMode: XpMode.AI,
						xpAward: 50,
						startDate: originalStartDate,
						startTime: originalStartTime,
						dueDate: originalDueDate,
						dueTime: originalDueTime,
						optional: task.optional ?? false,
					};
				});
				setSubtasks(formStates);
			} else {
				showNotification({
					message: "Failed to break down task. Try again.",
					variant: "warning",
				});
			}
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingState("idle");
		}
	};

	// ── Remove a subtask ──

	const handleRemoveSubtask = (index: number) => {
		setSubtasks((prev) => prev.filter((_, i) => i !== index));
		if (expandedIndex === index) {
			setExpandedIndex(null);
		} else if (expandedIndex !== null && expandedIndex > index) {
			setExpandedIndex(expandedIndex - 1);
		}
	};

	// ── Update a subtask field ──

	const updateSubtask = (
		index: number,
		field: keyof SubtaskFormState,
		value: SubtaskFormState[keyof SubtaskFormState],
	) => {
		setSubtasks((prev) =>
			prev.map((st, i) => (i === index ? { ...st, [field]: value } : st)),
		);
	};

	// ── Create all subtasks ──

	const handleCreateAll = async () => {
		setLoadingState("creating");
		try {
			for (const st of subtasks) {
				const finalCategory =
					st.category === CUSTOM_CATEGORY_LABEL
						? st.customCategory.trim()
						: st.category;
				const startDateUtc =
					st.startDate !== null ? localToUTC(st.startDate, st.startTime) : null;
				const dueDateUtc =
					st.dueDate !== null ? localToUTC(st.dueDate, st.dueTime) : null;

				let resolvedXp = st.xpAward;
				if (st.xpMode === XpMode.AI) {
					try {
						const xpRes = await apiClient.post<{
							xp?: number;
							error?: string;
						}>("/api/llm/xp-suggestion", {
							goal,
							taskName: st.title.trim(),
							description: st.description.trim() || undefined,
						});
						resolvedXp = xpRes.xp ?? 0;
					} catch {
						resolvedXp = 0;
					}
				}

				await createTask({
					projectId: project.id,
					title: st.title.trim(),
					description: st.description.trim() || null,
					category: finalCategory,
					xpAward: resolvedXp,
					xpMode: st.xpMode === XpMode.MANUAL ? "MANUAL" : "AI",
					startDate: startDateUtc?.date ?? null,
					hasStartTime: st.startTime !== null,
					dueDate: dueDateUtc?.date ?? null,
					hasDueTime: st.dueTime !== null,
					optional: st.optional,
				}).unwrap();
			}

			// Delete original task
			await deleteTask({ taskId: task.id }).unwrap();
			dispatch(invalidateTags(["Tasks"]));

			showNotification({
				message: `Created ${subtasks.length} subtasks`,
				variant: "success",
			});

			Modal.Manager.close(modalId);
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingState("idle");
		}
	};

	// ── Reset ──

	const handleReset = () => {
		setSubtasks([]);
		setLoadingState("idle");
		setExpandedIndex(null);
		hasFiredRef.current = false;
	};

	// ── Can submit ──

	const canSubmit = () => {
		if (subtasks.length === 0) return false;
		return subtasks.every((st) => {
			if (st.title.trim() === "") return false;
			if (
				st.category === CUSTOM_CATEGORY_LABEL &&
				st.customCategory.trim() === ""
			)
				return false;
			return true;
		});
	};

	return (
		<Modal
			id={modalId}
			size="2xl"
			loading={isLoading}
			loadingMessage={loadingMessage}
			onAfterClose={handleReset}
			onOpen={handleBreakdown}
		>
			<Modal.Header title="Break Down Task" />
			<Modal.Body>
				{subtasks.length === 0 && !isLoading && (
					<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
						AI will split this task into smaller subtasks...
					</p>
				)}

				{subtasks.length > 0 && (
					<Container direction="vertical" gap="sm" className="items-stretch">
						<p className={`text-sm ${StyleTheme.Text.Secondary} mb-1`}>
							Review the subtasks below. Click to expand and edit, or remove
							ones you don&apos;t need.
						</p>
						{subtasks.map((st, index) => {
							const isExpanded = expandedIndex === index;
							const categoryColor = getCategoryColor(
								st.category === CUSTOM_CATEGORY_LABEL
									? st.customCategory
									: st.category,
							);

							return (
								<div
									key={`subtask-${st.title}`}
									className={`rounded-xl border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} p-4`}
								>
									{/* Header row */}
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={() =>
												setExpandedIndex(isExpanded ? null : index)
											}
											className="flex-1 flex items-center gap-3 text-left min-w-0"
										>
											{isExpanded ? (
												<IoChevronUp
													className={`${StyleTheme.Text.Secondary} shrink-0 size-4`}
												/>
											) : (
												<IoChevronDown
													className={`${StyleTheme.Text.Secondary} shrink-0 size-4`}
												/>
											)}
											<TextPreview
												text={st.title}
												lines={1}
												size="sm"
												className={`font-semibold ${StyleTheme.Text.Primary}`}
											/>
											<span
												className="text-xs uppercase rounded-xl px-2 py-0.5 border font-medium shrink-0"
												style={{
													backgroundColor: `${categoryColor}10`,
													borderColor: `${categoryColor}80`,
													color: categoryColor,
												}}
											>
												{st.category === CUSTOM_CATEGORY_LABEL
													? st.customCategory || "Custom"
													: st.category}
											</span>
										</button>
										<button
											type="button"
											onClick={() => handleRemoveSubtask(index)}
											className="text-rose-400 hover:text-rose-300 p-1 shrink-0"
											title="Remove subtask"
										>
											<IoCloseOutline size={18} />
										</button>
									</div>

									{/* Description preview when collapsed */}
									{!isExpanded && st.description && (
										<div className="mt-2 pl-7">
											<TextPreview
												text={st.description}
												lines={2}
												size="sm"
												className={StyleTheme.Text.Secondary}
											/>
										</div>
									)}

									{/* Expanded form */}
									{isExpanded && (
										<div className="mt-3 pl-7">
											<TaskForm
												title={st.title}
												onTitleChange={(v) => updateSubtask(index, "title", v)}
												description={st.description}
												onDescriptionChange={(v) =>
													updateSubtask(index, "description", v)
												}
												category={st.category}
												onCategoryChange={(v) =>
													updateSubtask(index, "category", v)
												}
												customCategory={st.customCategory}
												onCustomCategoryChange={(v) =>
													updateSubtask(index, "customCategory", v)
												}
												xpMode={st.xpMode}
												onXpModeChange={(v) =>
													updateSubtask(index, "xpMode", v)
												}
												xpAward={st.xpAward}
												onXpAwardChange={(v) =>
													updateSubtask(index, "xpAward", v)
												}
												startDate={st.startDate}
												onStartDateChange={(v) =>
													updateSubtask(index, "startDate", v)
												}
												startTime={st.startTime}
												onStartTimeChange={(v) =>
													updateSubtask(index, "startTime", v)
												}
												dueDate={st.dueDate}
												onDueDateChange={(v) =>
													updateSubtask(index, "dueDate", v)
												}
												dueTime={st.dueTime}
												onDueTimeChange={(v) =>
													updateSubtask(index, "dueTime", v)
												}
												optional={st.optional}
												onOptionalChange={(v) =>
													updateSubtask(index, "optional", v)
												}
											/>
										</div>
									)}
								</div>
							);
						})}
					</Container>
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				<Button variant="secondary">Cancel</Button>
				<Button disabled={!canSubmit() || isLoading} onClick={handleCreateAll}>
					Create All
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
