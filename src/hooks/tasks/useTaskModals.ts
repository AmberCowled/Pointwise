"use client";

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { useCallback, useMemo, useState } from "react";

export type RecurringTaskData = {
	id: string;
	title: string;
	description: string | null;
	category: string;
	xpValue: number;
	startDate: string | null;
	recurrence: "daily" | "weekly" | "monthly";
	recurrenceDays: number[];
	recurrenceMonthDays: number[];
	timesOfDay: string[];
};

export type UseTaskModalsOptions = {};

export interface UseTaskModalsReturn {
	// Create modal state
	isCreateOpen: boolean;
	editorMode: "create" | "edit";
	editorTask: DashboardTask | null;
	editScope: "single" | "series";
	recurringTaskData: RecurringTaskData | null;
	editorVersion: number;
	createError: string | null;
	isCreating: boolean;
	isEditingTask: boolean;

	// Manage modal state
	isManageOpen: boolean;
	manageTask: DashboardTask | null;

	// Create modal handlers
	openCreateModal: (
		mode: "create" | "edit",
		task?: DashboardTask | null,
		scope?: "single" | "series",
	) => void;
	closeCreateModal: () => void;
	setCreateError: (error: string | null) => void;
	setIsCreating: (loading: boolean) => void;

	// Manage modal handlers
	openManageModal: (task: DashboardTask) => void;
	closeManageModal: () => void;

	// Edit handler
	handleEditTask: (task: DashboardTask, scope?: "single" | "series") => void;
}

/**
 * Hook for managing task modal state and interactions
 *
 * Handles:
 * - Create/edit modal state and opening/closing
 * - Manage modal state and opening/closing
 * - Fetching recurring task data when editing a series
 * - Loading states for async operations
 */
export function useTaskModals(options: UseTaskModalsOptions = {}): UseTaskModalsReturn {
	// Create modal state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
	const [editorTask, setEditorTask] = useState<DashboardTask | null>(null);
	const [editScope, setEditScope] = useState<"single" | "series">("single");
	const [editorVersion, setEditorVersion] = useState(0);
	const [createError, setCreateError] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isEditingTask, setIsEditingTask] = useState(false);

	// Manage modal state
	const [isManageOpen, setIsManageOpen] = useState(false);
	const [manageTask, setManageTask] = useState<DashboardTask | null>(null);

	// Extract recurring task data from task's recurrencePattern
	// This is computed from the current editorTask and editScope
	const recurringTaskData = useMemo<RecurringTaskData | null>(() => {
		if (editorMode !== "edit" || editScope !== "series" || !editorTask) {
			return null;
		}

		// Check if this is a template task (has recurrencePattern)
		const pattern = editorTask.recurrencePattern;
		if (!pattern) {
			return null;
		}

		// Extract recurrence data from pattern
		const startDate =
			editorTask.startDate instanceof Date
				? editorTask.startDate.toISOString().split("T")[0]
				: typeof editorTask.startDate === "string"
					? editorTask.startDate.split("T")[0]
					: null;

		return {
			id: editorTask.id,
			title: editorTask.title,
			description: editorTask.context ?? null,
			category: editorTask.category ?? "",
			xpValue: editorTask.xp,
			startDate,
			recurrence: pattern.type,
			recurrenceDays: pattern.daysOfWeek ?? [],
			recurrenceMonthDays: pattern.daysOfMonth ?? [],
			timesOfDay: pattern.timesOfDay ?? [],
		};
	}, [editorMode, editScope, editorTask]);

	// Open create modal
	const openCreateModal = useCallback(
		(
			mode: "create" | "edit",
			task: DashboardTask | null = null,
			scope: "single" | "series" = "single",
		) => {
			setEditorMode(mode);
			setEditorTask(task);
			setEditScope(scope);
			setEditorVersion((v) => v + 1);
			setCreateError(null);
			setIsCreateOpen(true);
		},
		[],
	);

	// Close create modal
	const closeCreateModal = useCallback(() => {
		setIsCreateOpen(false);
		setCreateError(null);
	}, []);

	// Open manage modal
	const openManageModal = useCallback((task: DashboardTask) => {
		setManageTask(task);
		setIsManageOpen(true);
	}, []);

	// Close manage modal
	const closeManageModal = useCallback(() => {
		setIsManageOpen(false);
		setManageTask(null);
	}, []);

	// Handle edit task (with loading state and scope detection)
	const handleEditTask = useCallback(
		(task: DashboardTask, scope?: "single" | "series") => {
			// Default to 'series' for template tasks (has recurrencePattern), 'single' for one-time tasks
			// If it's an instance (has sourceRecurringTaskId), default to 'single' to edit just that instance
			const isTemplate = !task.isRecurringInstance && task.recurrencePattern !== undefined;
			const defaultScope = isTemplate ? "series" : "single";
			const finalScope = scope ?? defaultScope;

			// Show loading state
			setIsEditingTask(true);

			try {
				// Open modal (recurringTaskData will be computed from task.recurrencePattern)
				openCreateModal("edit", task, finalScope);
				// Close manage modal after edit modal is ready
				setIsManageOpen(false);
			} finally {
				// Clear loading state after a brief delay to allow UI to update
				setTimeout(() => {
					setIsEditingTask(false);
				}, 0);
			}
		},
		[openCreateModal],
	);

	return {
		// Create modal state
		isCreateOpen,
		editorMode,
		editorTask,
		editScope,
		recurringTaskData,
		editorVersion,
		createError,
		isCreating,
		isEditingTask,

		// Manage modal state
		isManageOpen,
		manageTask,

		// Create modal handlers
		openCreateModal,
		closeCreateModal,
		setCreateError,
		setIsCreating,

		// Manage modal handlers
		openManageModal,
		closeManageModal,

		// Edit handler
		handleEditTask,
	};
}
