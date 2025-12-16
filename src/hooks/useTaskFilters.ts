"use client";

import type { TaskBoardViewMode } from "@pointwise/app/components/dashboard/task-board/types";
import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import {
	addDays,
	formatDateLabel,
	getDateTimeParts,
	startOfDay,
	toDateKey,
} from "@pointwise/lib/datetime";
import { useMemo } from "react";

export function useTaskFilters(
	tasks: DashboardTask[],
	selectedDate: Date,
	locale: string,
	timeZone: string,
	referenceTimestamp: number,
	viewMode: TaskBoardViewMode = "day",
) {
	const stableTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);
	// Calculate date range based on view mode
	const { rangeStart, rangeEnd } = useMemo(() => {
		const baseStart = startOfDay(selectedDate, timeZone);

		if (viewMode === "day") {
			return {
				rangeStart: baseStart,
				rangeEnd: addDays(baseStart, 1, timeZone),
			};
		}

		if (viewMode === "week") {
			// 7 days starting from selected date (like Analytics 7d)
			return {
				rangeStart: baseStart,
				rangeEnd: addDays(baseStart, 7, timeZone),
			};
		}

		// viewMode === 'month' - 30 days starting from selected date (like Analytics 30d)
		return {
			rangeStart: baseStart,
			rangeEnd: addDays(baseStart, 30, timeZone),
		};
	}, [selectedDate, timeZone, viewMode]);

	const scheduledTasks = useMemo(() => {
		const rangeStartMs = rangeStart.getTime();
		const rangeEndMs = rangeEnd.getTime();
		return stableTasks.filter((task) => {
			const { startDate, dueDate, startTime, dueTime, completed } = task;
			if (completed) return false;

			// A task is scheduled if it has both date and time
			// const hasStartDateTime = task.startDate;
			// const hasDueDateTime = task.dueDate;

			if (!startDate && !dueDate) return false;

			// Convert to Date objects for comparison
			const rawStart = startDate ? new Date(`${startDate}Z`) : null;
			const rawEnd = dueDate ? new Date(`${dueDate}Z`) : null;

			const taskStartMs = rawStart?.getTime() ?? rawEnd?.getTime() ?? Number.NEGATIVE_INFINITY;

			// For tasks with only start date/time, treat them as spanning the entire start date
			// For tasks with due date/time, use the due time as the end
			// If dueDate exists but no dueTime, treat it as spanning the entire day
			let taskEndMs: number;
			if (rawEnd) {
				// If task has dueTime, use the exact time; otherwise treat as end of day
				if (dueTime) {
					taskEndMs = rawEnd.getTime();
				} else {
					// Task has only dueDate (no dueTime): treat it as spanning the entire due date
					// Use end of the due date to ensure it overlaps with the day view
					const endDate = new Date(rawEnd);
					endDate.setUTCHours(23, 59, 59, 999);
					taskEndMs = endDate.getTime();
				}
			} else if (rawStart) {
				// Task has only start date/time: treat it as spanning the entire start date
				// Use end of the start date to ensure it overlaps with the day view
				const startDate = new Date(rawStart);
				startDate.setUTCHours(23, 59, 59, 999);
				taskEndMs = startDate.getTime();
			} else {
				taskEndMs = Number.POSITIVE_INFINITY;
			}

			// Task overlaps with range if:
			// - Task starts before range ends AND
			// - Task ends after range starts
			if (taskStartMs >= rangeEndMs) return false;
			if (taskEndMs < rangeStartMs) return false;

			return true;
		});
	}, [rangeStart, rangeEnd, stableTasks]);

	const optionalTasks = useMemo(
		() =>
			stableTasks.filter((task) => {
				if (task.completed) return false;

				// Also include tasks with no dates at all (legacy optional tasks)
				const hasNoDates = !task.startDate && !task.dueDate;

				return hasNoDates;
			}),
		[stableTasks],
	);

	const overdueTasks = useMemo(() => {
		return stableTasks
			.filter((task) => {
				if (task.completed) return false;
				if (!task.dueDate) return false;

				// If task has due time, use that; otherwise use end of due date
				const dueDateTime = task.dueTime
					? new Date(`${task.dueDate}T${task.dueTime}Z`)
					: new Date(`${task.dueDate}T23:59:59Z`);

				return dueDateTime.getTime() < referenceTimestamp;
			})
			.sort((a, b) => {
				const aDue = a.dueTime
					? new Date(`${a.dueDate}T${a.dueTime}Z`).getTime()
					: new Date(`${a.dueDate}T23:59:59Z`).getTime();
				const bDue = b.dueTime
					? new Date(`${b.dueDate}T${b.dueTime}Z`).getTime()
					: new Date(`${b.dueDate}T23:59:59Z`).getTime();
				return aDue - bDue;
			});
	}, [referenceTimestamp, stableTasks]);

	const selectedDateLabel = useMemo(() => {
		if (viewMode === "day") {
			return formatDateLabel(selectedDate, locale, timeZone);
		}

		if (viewMode === "week") {
			const endDate = addDays(rangeStart, 6, timeZone);
			// Format dates without weekday for cleaner range display
			const startParts = getDateTimeParts(rangeStart, timeZone);
			const endParts = getDateTimeParts(endDate, timeZone);
			const formatter = new Intl.DateTimeFormat(locale, {
				month: "short",
				day: "numeric",
				timeZone,
			});
			const startFormatted = formatter.format(
				new Date(Date.UTC(startParts.year, startParts.month - 1, startParts.day)),
			);
			const endFormatted = formatter.format(
				new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day)),
			);
			return `${startFormatted} - ${endFormatted}`;
		}

		// viewMode === 'month' - 30 days, show range
		const endDate = addDays(rangeStart, 29, timeZone);
		const startParts = getDateTimeParts(rangeStart, timeZone);
		const endParts = getDateTimeParts(endDate, timeZone);
		const formatter = new Intl.DateTimeFormat(locale, {
			month: "short",
			day: "numeric",
			timeZone,
		});
		const startFormatted = formatter.format(
			new Date(Date.UTC(startParts.year, startParts.month - 1, startParts.day)),
		);
		const endFormatted = formatter.format(
			new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day)),
		);
		return `${startFormatted} - ${endFormatted}`;
	}, [selectedDate, rangeStart, locale, timeZone, viewMode]);

	const selectedDateInputValue = useMemo(
		() => toDateKey(selectedDate, timeZone),
		[selectedDate, timeZone],
	);

	return {
		scheduledTasks,
		optionalTasks,
		overdueTasks,
		selectedDateLabel,
		selectedDateInputValue,
	};
}
