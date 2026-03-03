"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import InputArea from "@pointwise/app/components/ui/InputArea";
import Modal from "@pointwise/app/components/ui/modal";
import { useNotifications } from "@pointwise/app/components/ui/NotificationProvider";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { useCreateTaskMutation } from "@pointwise/generated/api";
import { apiClient } from "@pointwise/lib/api/client";
import { localToUTC } from "@pointwise/lib/api/date-time";
import { getErrorMessage } from "@pointwise/lib/api/errors";
import {
	CORE_TASK_CATEGORIES,
	CUSTOM_CATEGORY_LABEL,
	isCoreTaskCategory,
} from "@pointwise/lib/categories";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type {
	TaskExpandResponse,
	TaskSuggestion,
	TaskSuggestionsResponse,
} from "@pointwise/lib/validation/task-generation-schema";
import type { Task } from "@pointwise/lib/validation/tasks-schema";
import { useState } from "react";
import TaskForm, { XpMode } from "./TaskForm";

export interface GenerateTaskModalProps {
	project: Project;
	tasks: Task[];
}

type Step = "prompt" | "suggestions" | "review";
type LoadingState =
	| "idle"
	| "suggesting"
	| "expanding"
	| "generating"
	| "creating";

export default function GenerateTaskModal({
	project,
	tasks,
}: GenerateTaskModalProps) {
	const projectId = project.id;
	const goal = project.goal ?? null;

	// Step state
	const [step, setStep] = useState<Step>("prompt");
	const [userPrompt, setUserPrompt] = useState("");
	const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);

	// Task form state (Step 2: review)
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<string>(CORE_TASK_CATEGORIES[0]);
	const [customCategory, setCustomCategory] = useState("");
	const [xpMode, setXpMode] = useState<XpMode>(XpMode.AI);
	const [xpAward, setXpAward] = useState(50);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [startTime, setStartTime] = useState<string | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [dueTime, setDueTime] = useState<string | null>(null);
	const [optional, setOptional] = useState(false);

	const [loadingState, setLoadingState] = useState<LoadingState>("idle");
	const { showNotification } = useNotifications();
	const [createTask, { isLoading: isCreateLoading }] = useCreateTaskMutation();

	const isLoading = loadingState !== "idle" || isCreateLoading;

	const loadingMessage =
		loadingState === "suggesting"
			? "Generating suggestions"
			: loadingState === "expanding"
				? "Expanding task"
				: loadingState === "generating"
					? "Generating XP"
					: loadingState === "creating"
						? "Creating Task"
						: undefined;

	// ── Generate suggestions ──

	const handleGenerate = async () => {
		setLoadingState("suggesting");
		try {
			const existingTasks = tasks.map((t) => ({
				title: t.title,
				category: t.category,
				status: t.status ?? "PENDING",
			}));

			const res = await apiClient.post<TaskSuggestionsResponse>(
				"/api/llm/task-suggestions",
				{
					projectId,
					goal,
					existingTasks,
					userPrompt: userPrompt.trim() || undefined,
				},
			);

			if (res.suggestions && res.suggestions.length > 0) {
				setSuggestions(res.suggestions);
				setStep("suggestions");
			} else {
				showNotification({
					message: "No suggestions were generated. Try a different prompt.",
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

	// ── Select and expand a suggestion ──

	const handleSelectSuggestion = async (suggestion: TaskSuggestion) => {
		setLoadingState("expanding");
		try {
			const res = await apiClient.post<TaskExpandResponse>(
				"/api/llm/task-expand",
				{
					projectId,
					goal,
					title: suggestion.title,
					summary: suggestion.summary,
				},
			);

			// Map AI category to form category
			if (isCoreTaskCategory(res.category)) {
				setCategory(res.category);
				setCustomCategory("");
			} else {
				setCategory(CUSTOM_CATEGORY_LABEL);
				setCustomCategory(res.category);
			}

			setTitle(res.title);
			setDescription(res.description);
			setXpMode(XpMode.AI);
			setXpAward(50);
			setStartDate(null);
			setStartTime(null);
			setDueDate(null);
			setDueTime(null);
			setOptional(false);
			setStep("review");
		} catch (err) {
			showNotification({
				message: getErrorMessage(err),
				variant: "error",
			});
		} finally {
			setLoadingState("idle");
		}
	};

	// ── Create the task (same flow as CreateTaskModal) ──

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
				optional,
			}).unwrap();

			Modal.Manager.close(`generate-task-modal-${projectId}`);
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
		setStep("prompt");
		setUserPrompt("");
		setSuggestions([]);
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

	const handleBack = () => {
		if (step === "review") {
			setStep("suggestions");
		} else if (step === "suggestions") {
			setStep("prompt");
		}
	};

	const canSubmit = () => {
		if (title.trim() === "") return false;
		if (category === CUSTOM_CATEGORY_LABEL && customCategory.trim() === "") {
			return false;
		}
		return true;
	};

	// ── Render ──

	return (
		<Modal
			id={`generate-task-modal-${projectId}`}
			size="2xl"
			loading={isLoading}
			loadingMessage={loadingMessage}
			onAfterClose={handleReset}
		>
			<Modal.Header
				title={
					step === "prompt"
						? "Generate Task"
						: step === "suggestions"
							? "Select a Suggestion"
							: "Review Task"
				}
			/>
			<Modal.Body>
				{step === "prompt" && (
					<Container direction="vertical" gap="md" className="items-stretch">
						<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
							Describe what you&apos;d like to focus on, or leave blank to get
							general suggestions based on your project.
						</p>
						<InputArea
							label="Focus area"
							placeholder="e.g. Bug fixes, new features, documentation..."
							rows={3}
							maxLength={500}
							flex="grow"
							defaultValue={userPrompt}
							onChange={setUserPrompt}
						/>
					</Container>
				)}

				{step === "suggestions" && (
					<Container direction="vertical" gap="sm" className="items-stretch">
						<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
							Pick a suggestion to expand into a full task.
						</p>
						{suggestions.map((suggestion) => (
							<button
								key={suggestion.title}
								type="button"
								onClick={() => handleSelectSuggestion(suggestion)}
								disabled={isLoading}
								className={`w-full rounded-xl border ${StyleTheme.Container.Border.Primary} ${StyleTheme.Container.BackgroundInput} p-4 text-left transition ${StyleTheme.Hover.Subtle} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								<p
									className={`text-sm font-semibold ${StyleTheme.Text.Primary}`}
								>
									{suggestion.title}
								</p>
								<p className={`mt-1 text-sm ${StyleTheme.Text.Secondary}`}>
									{suggestion.summary}
								</p>
							</button>
						))}
					</Container>
				)}

				{step === "review" && (
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
				)}
			</Modal.Body>
			<Modal.Footer align="end">
				{step === "prompt" && <Button variant="secondary">Cancel</Button>}
				{step !== "prompt" && (
					<Button variant="secondary" onClick={handleBack}>
						Back
					</Button>
				)}
				{step === "prompt" && (
					<Button disabled={isLoading} onClick={handleGenerate}>
						Generate
					</Button>
				)}
				{step === "review" && (
					<Button
						disabled={!canSubmit() || isLoading}
						onClick={handleCreateTask}
					>
						Create
					</Button>
				)}
			</Modal.Footer>
		</Modal>
	);
}
