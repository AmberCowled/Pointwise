import {
	isProjectAdmin,
	isProjectUserOrHigher,
	verifyProjectAccess,
} from "@pointwise/lib/api/projects";
import { awardXpForTaskCompletion } from "@pointwise/lib/api/xp";
import prisma from "@pointwise/lib/prisma";
import {
	type CreateTaskRequest,
	type Task,
	TaskSchema,
	type UpdateTaskRequest,
} from "@pointwise/lib/validation/tasks-schema";
import type { Prisma, Task as PrismaTask } from "@prisma/client";

export async function getTasks(
	projectId: string,
	userId: string,
): Promise<PrismaTask[]> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const tasks = await prisma.task.findMany({
		where: {
			projectId: projectId,
		},
	});

	return tasks;
}

export async function createTask(
	request: CreateTaskRequest,
	userId: string,
): Promise<PrismaTask> {
	if (!(await isProjectUserOrHigher(request.projectId, userId))) {
		throw new Error(
			"Forbidden: You do not have write permissions in this project",
		);
	}

	const newTask = await prisma.task.create({
		data: {
			projectId: request.projectId,
			title: request.title,
			description: request.description ?? null,
			xpAward: request.xpAward ?? 0,
			category: request.category,
			optional: request.optional ?? false,
			startDate: request.startDate ?? null,
			hasStartTime: request.hasStartTime ?? false,
			dueDate: request.dueDate ? new Date(request.dueDate) : null,
			hasDueTime: request.hasDueTime ?? false,
			status: "PENDING",
		},
	});

	return newTask;
}

// Type that only includes the fields we can update from UpdateTaskRequest
type TaskUpdateFields = Pick<
	Prisma.TaskUpdateInput,
	| "title"
	| "description"
	| "xpAward"
	| "category"
	| "optional"
	| "startDate"
	| "hasStartTime"
	| "dueDate"
	| "hasDueTime"
	| "status"
	| "completedAt"
>;

export async function updateTask(
	taskId: string,
	request: UpdateTaskRequest,
	userId: string,
): Promise<PrismaTask> {
	const existingTask = await prisma.task.findUnique({
		where: { id: taskId },
		select: {
			projectId: true,
			status: true,
			title: true,
			category: true,
			xpAward: true,
			project: { select: { name: true } },
		},
	});

	if (!existingTask) {
		throw new Error("Task not found");
	}

	if (!(await isProjectUserOrHigher(existingTask.projectId, userId))) {
		throw new Error(
			"Forbidden: You do not have write permissions in this project",
		);
	}

	const updateData: Partial<TaskUpdateFields> = {};
	if (request.title !== undefined) {
		updateData.title = request.title;
	}
	if (request.description !== undefined) {
		updateData.description = request.description ?? null;
	}
	if (request.xpAward !== undefined) {
		updateData.xpAward = request.xpAward;
	}
	if (request.category !== undefined) {
		updateData.category = request.category;
	}
	if (request.optional !== undefined) {
		updateData.optional = request.optional;
	}
	if (request.startDate !== undefined) {
		updateData.startDate = request.startDate
			? new Date(request.startDate)
			: null;
	}
	if (request.hasStartTime !== undefined) {
		updateData.hasStartTime = request.hasStartTime;
	}
	if (request.dueDate !== undefined) {
		updateData.dueDate = request.dueDate ? new Date(request.dueDate) : null;
	}
	if (request.hasDueTime !== undefined) {
		updateData.hasDueTime = request.hasDueTime;
	}
	if (request.status !== undefined) {
		updateData.status = request.status;
		if (request.status === "COMPLETED") {
			updateData.completedAt = request.completedAt
				? new Date(request.completedAt)
				: null;
		} else if (request.status === "PENDING") {
			updateData.completedAt = null;
		}
	}

	const updatedTask = await prisma.task.update({
		where: { id: taskId },
		data: updateData,
	});

	// When transitioning to COMPLETED, award XP and create XPEvent
	const isNewlyCompleted =
		existingTask.status !== "COMPLETED" &&
		(request.status === "COMPLETED" || updatedTask.status === "COMPLETED");
	if (isNewlyCompleted && updatedTask.xpAward > 0) {
		await awardXpForTaskCompletion(
			userId,
			updatedTask.xpAward,
			existingTask.project.name ?? null,
			updatedTask.title,
			updatedTask.category ?? null,
		);
	}

	return updatedTask;
}

export async function deleteTask(
	taskId: string,
	userId: string,
): Promise<void> {
	const task = await prisma.task.findUnique({
		where: { id: taskId },
		select: { projectId: true },
	});

	if (!task) {
		throw new Error("Task not found");
	}

	if (!(await isProjectAdmin(task.projectId, userId))) {
		throw new Error(
			"Forbidden: You must be an admin to delete tasks in this project",
		);
	}

	await prisma.task.delete({
		where: { id: taskId },
	});
}

export function serializeTask(task: PrismaTask): Task {
	return TaskSchema.parse({
		id: task.id,
		title: task.title,
		description: task.description,
		xpAward: task.xpAward,
		projectId: task.projectId,
		category: task.category,
		optional: task.optional,
		startDate: task.startDate?.toString() ?? null,
		hasStartTime: task.hasStartTime,
		dueDate: task.dueDate?.toString() ?? null,
		hasDueTime: task.hasDueTime,
		completedAt: task.completedAt?.toString() ?? null,
		status: task.status as "PENDING" | "COMPLETED",
		createdAt: task.createdAt.toString(),
		updatedAt: task.updatedAt.toString(),
	});
}
