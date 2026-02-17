"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { useCreateTaskMutation } from "@pointwise/generated/api";
import { apiClient } from "@pointwise/lib/api/client";
import { localToUTC } from "@pointwise/lib/api/date-time";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
} from "@pointwise/lib/categories";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { useState } from "react";
import TaskForm, { XpMode } from "./TaskForm";

export interface CreateTaskModalProps {
	project: Project;
}

type LoadingState = "idle" | "generating" | "creating";

export default function CreateTaskModal({ project }: CreateTaskModalProps) {
	const projectId = project.id;
	const goal = project.goal ?? null;
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [category, setCategory] = useState<string>(CORE_TASK_CATEGORIES[0]);
	const [customCategory, setCustomCategory] = useState<string>("");
	const [xpMode, setXpMode] = useState<XpMode>(XpMode.AI);
	const [xpAward, setXpAward] = useState<number>(50);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [startTime, setStartTime] = useState<string | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [dueTime, setDueTime] = useState<string | null>(null);
	const [optional, setOptional] = useState<boolean>(false);
	const [loadingState, setLoadingState] = useState<LoadingState>("idle");

	const { showNotification } = useNotifications();
	const [createTask, { isLoading: isCreateLoading }] = useCreateTaskMutation();

	const handleCreateTask = async () => {
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
						goal,
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
			setLoadingState("creating");
		}

		try {
			await createTask({
				projectId,
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
			}).unwrap();

			Modal.Manager.close(`create-task-modal-${projectId}`);
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingState("idle");
		}
	};

	const isLoading = loadingState !== "idle" || isCreateLoading;
	const loadingMessage =
		loadingState === "generating"
			? "Generating XP"
			: loadingState === "creating"
				? "Creating Task"
				: undefined;

	const handleReset = () => {
		setTitle("");
		setDescription("");
		setCategory(CORE_TASK_CATEGORIES[0]);
		setCustomCategory("");
		setXpMode(XpMode.AI);
		setXpAward(50);
		setStartDate(null);
		setStartTime(null);
		setDueDate(null);
		setDueTime(null);
		setOptional(false);
		setLoadingState("idle");
	};

	const canSubmit = () => {
		if (title.trim() === "") return false;
		if (category === CUSTOM_CATEGORY_LABEL && customCategory.trim() === "") {
			return false;
		}
		return true;
	};

	return (
		<Modal
			id={`create-task-modal-${projectId}`}
			size="2xl"
			loading={isLoading}
			loadingMessage={loadingMessage}
			onAfterClose={handleReset}
		>
			<Modal.Header title="Create Task" />
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
				<Button disabled={!canSubmit() || isLoading} onClick={handleCreateTask}>
					Create
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
