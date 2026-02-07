"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Modal from "@pointwise/app/components/ui/modal";
import { localToUTC } from "@pointwise/lib/api/date-time";
import { llmApi } from "@pointwise/lib/api/llm";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
} from "@pointwise/lib/categories";
import { useCreateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useState } from "react";
import TaskForm, { XP_MODE_AI, type XpMode } from "./TaskForm";

export interface CreateTaskModalProps {
	projectId: string;
}

export default function CreateTaskModal({ projectId }: CreateTaskModalProps) {
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [category, setCategory] = useState<string>(CORE_TASK_CATEGORIES[0]);
	const [customCategory, setCustomCategory] = useState<string>("");
	const [xpMode, setXpMode] = useState<XpMode>(XP_MODE_AI);
	const [xpAward, setXpAward] = useState<number>(50);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [startTime, setStartTime] = useState<string | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [dueTime, setDueTime] = useState<string | null>(null);
	const [optional, setOptional] = useState<boolean>(false);

	const [createTask, { isLoading }] = useCreateTaskMutation();

	const handleCreateTask = async () => {
		const finalCategory =
			category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
		const startDateUtc =
			startDate !== null ? localToUTC(startDate, startTime) : null;
		const dueDateUtc = dueDate !== null ? localToUTC(dueDate, dueTime) : null;

		const isAiSuggested = xpMode === XP_MODE_AI;

		const response = await createTask({
			projectId,
			title: title.trim(),
			description: description.trim() || null,
			category: finalCategory,
			xpAward: isAiSuggested ? 0 : xpAward,
			xpAwardSource: isAiSuggested ? "AI_PENDING" : "MANUAL",
			startDate: startDateUtc !== null ? startDateUtc?.date : null,
			hasStartTime: startTime !== null,
			dueDate: dueDateUtc !== null ? dueDateUtc?.date : null,
			hasDueTime: dueTime !== null,
			optional: optional,
		}).unwrap();

		if (isAiSuggested && response.task?.id) {
			try {
				await llmApi.submitXpSuggestion(response.task.id);
			} catch {
				// Task is created with AI_PENDING; user can retry from card
			}
		}

		Modal.Manager.close(`create-task-modal-${projectId}`);
	};

	const handleReset = () => {
		setTitle("");
		setDescription("");
		setCategory(CORE_TASK_CATEGORIES[0]);
		setCustomCategory("");
		setXpMode(XP_MODE_AI);
		setXpAward(50);
		setStartDate(null);
		setStartTime(null);
		setDueDate(null);
		setDueTime(null);
		setOptional(false);
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
				<Button disabled={!canSubmit()} onClick={handleCreateTask}>
					Create
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
