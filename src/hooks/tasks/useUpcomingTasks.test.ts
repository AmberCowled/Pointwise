/**
 * Tests for useUpcomingTasks hook
 *
 * Tests filtering and sorting of upcoming tasks
 */

import type { DashboardTask } from "@pointwise/app/components/dashboard/tasks/TaskList";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpcomingTasks } from "./useUpcomingTasks";

// Mock datetime functions
vi.mock("@pointwise/lib/datetime", async () => {
	const actual = await vi.importActual("@pointwise/lib/datetime");
	return {
		...actual,
		startOfDay: vi.fn((date: Date, tz?: string) => {
			const d = new Date(date);
			d.setUTCHours(0, 0, 0, 0);
			return d;
		}),
		toDate: vi.fn((input?: string | Date | null) => {
			if (!input) return null;
			if (input instanceof Date) return input;
			const parsed = new Date(input);
			return Number.isNaN(parsed.getTime()) ? null : parsed;
		}),
	};
});

const createMockTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => ({
	id: "task-1",
	title: "Test Task",
	context: "Test context",
	category: "Work",
	xp: 50,
	status: "scheduled",
	startDate: null,
	dueDate: null,
	completedAt: null,
	sourceRecurringTaskId: null,
	...overrides,
});

describe("useUpcomingTasks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const timeZone = "UTC";

	it("should return empty array when no tasks provided", () => {
		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toEqual([]);
	});

	it("should filter out completed tasks", () => {
		const tasks = [
			createMockTask({
				id: "1",
				completed: true,
				dueDate: new Date("2025-12-20T09:00:00Z"),
			}),
			createMockTask({
				id: "2",
				completed: false,
				dueDate: new Date("2025-12-21T09:00:00Z"),
			}),
		];

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks,
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("2");
	});

	it("should filter out tasks already in scheduled tasks", () => {
		const scheduledTask = createMockTask({
			id: "1",
			dueDate: new Date("2025-12-20T09:00:00Z"),
		});
		const upcomingTask = createMockTask({
			id: "2",
			dueDate: new Date("2025-12-21T09:00:00Z"),
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [scheduledTask, upcomingTask],
				scheduledTasks: [scheduledTask],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("2");
	});

	it("should filter out tasks with dates in the past", () => {
		const pastTask = createMockTask({
			id: "1",
			dueDate: new Date("2024-01-01T09:00:00Z"), // Past date
		});
		const futureTask = createMockTask({
			id: "2",
			dueDate: new Date("2025-12-21T09:00:00Z"), // Future date
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [pastTask, futureTask],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("2");
	});

	it("should use startDate if dueDate is not available", () => {
		const task = createMockTask({
			id: "1",
			startDate: new Date("2025-12-21T09:00:00Z"),
			dueDate: null,
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [task],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("1");
	});

	it("should prefer dueDate over startDate when both are available", () => {
		const task = createMockTask({
			id: "1",
			startDate: new Date("2025-12-20T09:00:00Z"),
			dueDate: new Date("2025-12-21T09:00:00Z"),
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [task],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("1");
	});

	it("should filter out tasks with no dates", () => {
		const taskWithDate = createMockTask({
			id: "1",
			dueDate: new Date("2025-12-21T09:00:00Z"),
		});
		const taskWithoutDate = createMockTask({
			id: "2",
			startDate: null,
			dueDate: null,
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [taskWithDate, taskWithoutDate],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
		expect(result.current.upcomingTasks[0].id).toBe("1");
	});

	it("should sort tasks by date (earliest first)", () => {
		const tasks = [
			createMockTask({ id: "3", dueDate: new Date("2025-12-23T09:00:00Z") }),
			createMockTask({ id: "1", dueDate: new Date("2025-12-21T09:00:00Z") }),
			createMockTask({ id: "2", dueDate: new Date("2025-12-22T09:00:00Z") }),
		];

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks,
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(3);
		expect(result.current.upcomingTasks[0].id).toBe("1");
		expect(result.current.upcomingTasks[1].id).toBe("2");
		expect(result.current.upcomingTasks[2].id).toBe("3");
	});

	it("should handle tasks with string dates", () => {
		const task = createMockTask({
			id: "1",
			dueDate: "2025-12-21T09:00:00Z" as any,
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [task],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(1);
	});

	it("should handle mixed date formats", () => {
		const task1 = createMockTask({
			id: "1",
			dueDate: new Date("2025-12-21T09:00:00Z"),
		});
		const task2 = createMockTask({
			id: "2",
			startDate: new Date("2025-12-22T09:00:00Z"),
			dueDate: null,
		});

		const { result } = renderHook(() =>
			useUpcomingTasks({
				tasks: [task1, task2],
				scheduledTasks: [],
				timeZone,
			}),
		);

		expect(result.current.upcomingTasks).toHaveLength(2);
		expect(result.current.upcomingTasks[0].id).toBe("1");
		expect(result.current.upcomingTasks[1].id).toBe("2");
	});
});
