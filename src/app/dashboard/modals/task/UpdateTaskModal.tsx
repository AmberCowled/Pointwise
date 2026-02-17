import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useUpdateTaskMutation } from "@pointwise/generated/api";
import { apiClient } from "@pointwise/lib/api/client";
import {
	datesEqual,
	localToUTC,
	timesEqual,
	utcToLocal,
} from "@pointwise/lib/api/date-time";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import { hasDeleteAccess } from "@pointwise/lib/api/projects";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
	isCoreTaskCategory,
} from "@pointwise/lib/categories";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useCallback, useEffect, useState } from "react";
import DeleteTaskModal from "./DeleteTaskModal";
import TaskForm, { XpMode } from "./TaskForm";

export interface UpdateTaskModalProps {
	task: Task;
	project: Project;
}

export default function UpdateTaskModal({
	task,
	project,
}: UpdateTaskModalProps) {
	const localStartDate = utcToLocal(task?.startDate ?? "");
	const localDueDate = utcToLocal(task?.dueDate ?? "");

	// Initialize state from task data
	const [title, setTitle] = useState<string>(task?.title ?? "");
	const [description, setDescription] = useState<string>(
		task?.description ?? "",
	);
	const taskCategory = task?.category ?? "";
	const isTaskCustomCategory =
		taskCategory && !isCoreTaskCategory(taskCategory);
	const [category, setCategory] = useState<string>(
		isTaskCustomCategory
			? CUSTOM_CATEGORY_LABEL
			: taskCategory || CORE_TASK_CATEGORIES[0],
	);
	const [customCategory, setCustomCategory] = useState<string>(
		isTaskCustomCategory ? taskCategory : "",
	);
	const taskXpMode = task?.xpMode === "MANUAL" ? XpMode.MANUAL : XpMode.AI;
	const [xpMode, setXpMode] = useState<XpMode>(taskXpMode);
	const [xpAward, setXpAward] = useState<number>(task?.xpAward ?? 50);
	const [startDate, setStartDate] = useState<Date | null>(
		localStartDate?.date ?? null,
	);
	const [startTime, setStartTime] = useState<string | null>(
		task?.hasStartTime ? (localStartDate?.time ?? null) : null,
	);
	const [dueDate, setDueDate] = useState<Date | null>(
		localDueDate?.date ?? null,
	);
	const [dueTime, setDueTime] = useState<string | null>(
		task?.hasDueTime ? (localDueDate?.time ?? null) : null,
	);
	const [optional, setOptional] = useState<boolean>(task?.optional ?? false);
	const [loadingState, setLoadingState] = useState<
		"idle" | "generating" | "updating"
	>("idle");

	const { showNotification } = useNotifications();
	const [updateTask, { isLoading: isUpdateLoading }] = useUpdateTaskMutation();

	// Reset state from task data - reusable function
	const resetStateFromTask = useCallback(() => {
		const localStartDate = utcToLocal(task?.startDate ?? "");
		const localDueDate = utcToLocal(task?.dueDate ?? "");
		const taskCategory = task?.category ?? "";
		const isTaskCustomCategory =
			taskCategory && !isCoreTaskCategory(taskCategory);

		setTitle(task?.title ?? "");
		setDescription(task?.description ?? "");
		setCategory(
			isTaskCustomCategory
				? CUSTOM_CATEGORY_LABEL
				: taskCategory || CORE_TASK_CATEGORIES[0],
		);
		setCustomCategory(isTaskCustomCategory ? taskCategory : "");
		setXpMode(task?.xpMode === "MANUAL" ? XpMode.MANUAL : XpMode.AI);
		setXpAward(task?.xpAward ?? 50);
		setStartDate(localStartDate?.date ?? null);
		setStartTime(task?.hasStartTime ? (localStartDate?.time ?? null) : null);
		setDueDate(localDueDate?.date ?? null);
		setDueTime(task?.hasDueTime ? (localDueDate?.time ?? null) : null);
		setOptional(task?.optional ?? false);
		setLoadingState("idle");
	}, [
		task?.title,
		task?.description,
		task?.category,
		task?.xpAward,
		task?.xpMode,
		task?.optional,
		task?.startDate,
		task?.dueDate,
		task?.hasStartTime,
		task?.hasDueTime,
	]);

	// Sync state when task changes (similar to UpdateProjectModal)
	useEffect(() => {
		resetStateFromTask();
	}, [resetStateFromTask]);

	const handleUpdateTask = async () => {
		const finalCategory =
			category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
		const startDateUtc =
			startDate !== null ? localToUTC(startDate, startTime) : null;
		const dueDateUtc = dueDate !== null ? localToUTC(dueDate, dueTime) : null;
		const isAiSuggested = xpMode === XpMode.AI;

		let resolvedXp = xpAward;

		if (isAiSuggested) {
			setLoadingState("generating");
			try {
				const res = await apiClient.post<{ xp?: number; error?: string }>(
					"/api/llm/xp-suggestion",
					{
						goal: project.goal ?? null,
						taskName: title.trim(),
						description: description.trim() || undefined,
					},
				);
				if (res.xp !== undefined) {
					resolvedXp = res.xp;
				} else {
					resolvedXp = 0;
				}
			} catch (err) {
				showNotification({
					message: getErrorMessage(err),
					variant: "error",
				});
				setLoadingState("idle");
				return;
			}
			setLoadingState("updating");
		}

		try {
			await updateTask({
				taskId: task.id,
				data: {
					projectId: project.id,
					title: title.trim(),
					description: description.trim() || null,
					category: finalCategory,
					xpAward: resolvedXp,
					xpMode: xpMode === XpMode.MANUAL ? "MANUAL" : "AI",
					startDate: startDateUtc !== null ? startDateUtc?.date : null,
					hasStartTime: startTime !== null,
					dueDate: dueDateUtc !== null ? dueDateUtc?.date : null,
					hasDueTime: dueTime !== null,
					optional: optional,
				},
			}).unwrap();

			Modal.Manager.close(`update-task-modal-${task.id}`);
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingState("idle");
		}
	};

	const isLoading = loadingState !== "idle" || isUpdateLoading;
	const loadingMessage =
		loadingState === "generating"
			? "Generating XP"
			: loadingState === "updating"
				? "Updating Task"
				: undefined;

	const canSubmit = () => {
		if (title.trim() === "") return false;
		if (category === CUSTOM_CATEGORY_LABEL && customCategory.trim() === "") {
			return false;
		}

		// Calculate final category values for comparison
		const finalCategory =
			category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
		const taskFinalCategory = task.category ?? "";

		// Normalize undefined -> null so datesEqual/timesEqual treat "no value" consistently
		const origStartDate = localStartDate?.date ?? null;
		const origDueDate = localDueDate?.date ?? null;
		const origStartTime = task?.hasStartTime
			? (localStartDate?.time ?? null)
			: null;
		const origDueTime = task?.hasDueTime ? (localDueDate?.time ?? null) : null;

		const startDateChanged = !datesEqual(origStartDate, startDate);
		const dueDateChanged = !datesEqual(origDueDate, dueDate);
		const startTimeChanged = !timesEqual(origStartTime, startTime);
		const dueTimeChanged = !timesEqual(origDueTime, dueTime);

		// Check if date/time combination changed
		const startDateTimeChanged = startDateChanged || startTimeChanged;
		const dueDateTimeChanged = dueDateChanged || dueTimeChanged;

		// Compare against task's stored xpMode (AI = re-evaluate on save, MANUAL = fixed xpAward)
		const origXpMode = task.xpMode === "MANUAL" ? XpMode.MANUAL : XpMode.AI;
		const xpModeChanged = xpMode !== origXpMode;
		// In AI mode, XP is re-evaluated on save; only count xpAward as changed in Manual mode
		const xpAwardChanged =
			xpMode === XpMode.MANUAL && xpAward !== (task.xpAward ?? 50);

		// Compare all fields - Update disabled until an actual change
		if (
			title !== (task.title ?? "") ||
			description !== (task.description ?? "") ||
			finalCategory !== taskFinalCategory ||
			xpModeChanged ||
			xpAwardChanged ||
			optional !== (task.optional ?? false) ||
			startDateTimeChanged ||
			dueDateTimeChanged
		) {
			return true;
		}
		return false;
	};

	return (
		<>
			<DeleteTaskModal task={task} />
			<Modal
				id={`update-task-modal-${task.id}`}
				size="2xl"
				loading={isLoading}
				loadingMessage={loadingMessage}
				onOpen={resetStateFromTask}
			>
				<Modal.Header title="Update Task" />
				<Modal.Body>
					<TaskForm
						title={title}
						onTitleChange={setTitle}
						description={description}
						onDescriptionChange={setDescription}
						category={category}
						onCategoryChange={setCategory}
						customCategory={customCategory}
						onCustomCategoryChange={setCustomCategory}
						xpMode={xpMode}
						onXpModeChange={setXpMode}
						xpAward={xpAward}
						onXpAwardChange={setXpAward}
						startDate={startDate}
						onStartDateChange={setStartDate}
						startTime={startTime}
						onStartTimeChange={setStartTime}
						dueDate={dueDate}
						onDueDateChange={setDueDate}
						dueTime={dueTime}
						onDueTimeChange={setDueTime}
						optional={optional}
						onOptionalChange={setOptional}
					/>
				</Modal.Body>
				<Modal.Footer align="end">
					<Button variant="secondary">Cancel</Button>
					{hasDeleteAccess(project.role) && (
						<Button
							variant="danger"
							onClick={() => Modal.Manager.open(`delete-task-modal-${task.id}`)}
						>
							Delete
						</Button>
					)}
					<Button
						disabled={!canSubmit() || isLoading}
						onClick={handleUpdateTask}
					>
						Update
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
