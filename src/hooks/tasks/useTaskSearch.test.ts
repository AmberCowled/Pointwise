/**
 * Tests for useTaskSearch hook
 *
 * Tests task filtering by search query
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTaskSearch } from "./useTaskSearch";

const createMockTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => ({
	id: "task-1",
	title: "Test Task",
	context: "Test description",
	category: "Work",
	xp: 50,
	status: "scheduled",
	startDate: null,
	dueDate: null,
	completedAt: null,
	sourceRecurringTaskId: null,
	...overrides,
});

describe("useTaskSearch", () => {
	const mockTasks: DashboardTask[] = [
		createMockTask({
			id: "1",
			title: "Complete project",
			category: "Work",
			context: "Finish the project documentation",
		}),
		createMockTask({
			id: "2",
			title: "Buy groceries",
			category: "Personal",
			context: "Milk, eggs, bread",
		}),
		createMockTask({
			id: "3",
			title: "Workout routine",
			category: "Health",
			context: "Gym session at 6pm",
		}),
	];

	it("should return all tasks when search query is empty", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(3);
		expect(result.current.filteredTasks).toEqual(mockTasks);
	});

	it("should filter tasks by title (case-insensitive)", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "project",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
		expect(result.current.filteredTasks[0].title).toBe("Complete project");
	});

	it("should filter tasks by title (case-insensitive, partial match)", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "PROJECT",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
		expect(result.current.filteredTasks[0].title).toBe("Complete project");
	});

	it("should filter tasks by category", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "work",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(2);
		expect(result.current.filteredTasks.map((t) => t.title)).toContain("Complete project");
		expect(result.current.filteredTasks.map((t) => t.title)).toContain("Workout routine");
	});

	it("should filter tasks by description/context", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "documentation",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
		expect(result.current.filteredTasks[0].title).toBe("Complete project");
	});

	it("should filter tasks by partial match in description", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "gym",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
		expect(result.current.filteredTasks[0].title).toBe("Workout routine");
	});

	it("should return empty array when no tasks match", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "nonexistent",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(0);
	});

	it("should handle empty tasks array", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: [],
				searchQuery: "test",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(0);
	});

	it("should handle tasks with null context", () => {
		const tasksWithNullContext: DashboardTask[] = [
			createMockTask({
				id: "1",
				title: "Task without context",
				context: null,
			}),
		];

		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: tasksWithNullContext,
				searchQuery: "without",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
	});

	it("should match multiple fields in same task", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "groceries",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
		expect(result.current.filteredTasks[0].title).toBe("Buy groceries");
	});

	it("should handle special characters in search query", () => {
		const tasksWithSpecialChars: DashboardTask[] = [
			createMockTask({
				id: "1",
				title: "Task with @special chars",
				context: "Testing #hashtag",
			}),
		];

		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: tasksWithSpecialChars,
				searchQuery: "special",
			}),
		);

		expect(result.current.filteredTasks).toHaveLength(1);
	});

	it("should handle whitespace in search query", () => {
		const { result } = renderHook(() =>
			useTaskSearch({
				tasks: mockTasks,
				searchQuery: "  project  ",
			}),
		);

		// Should trim and still match
		expect(result.current.filteredTasks).toHaveLength(1);
	});
});
