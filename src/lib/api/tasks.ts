import {
	isProjectAdmin,
	isProjectUserOrHigher,
	verifyProjectAccess,
} from "@pointwise/lib/api/projectsV2";
import prisma from "@pointwise/lib/prisma";
import {
	type CreateTaskRequest,
	type TaskV2,
	TaskV2Schema,
	type UpdateTaskRequest,
} from "@pointwise/lib/validation/tasks-schema";
import type { TaskV2 as PrismaTaskV2 } from "@prisma/client";

export async function getTasks(projectId: string, userId: string): Promise<PrismaTaskV2[]> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const tasks = await prisma.taskV2.findMany({
		where: {
			projectId: projectId,
		},
	});

	return tasks;
}

export async function createTask(
	request: CreateTaskRequest,
	userId: string,
): Promise<PrismaTaskV2> {
	if (!(await isProjectUserOrHigher(request.projectId, userId))) {
		throw new Error("Forbidden: You do not have write permissions in this project");
	}

	const newTask = await prisma.taskV2.create({
		data: {
			projectId: request.projectId,
			title: request.title,
			description: request.description ?? null,
			xpAward: request.xpAward ?? 0,
			category: request.category,
			optional: request.optional ?? false,
			startDate: request.startDate ? new Date(request.startDate) : null,
			startTime: request.startTime ?? null,
			dueDate: request.dueDate ? new Date(request.dueDate) : null,
			dueTime: request.dueTime ?? null,
			status: "PENDING",
		},
	});

	return newTask;
}

export async function updateTask(
	taskId: string,
	request: UpdateTaskRequest,
	userId: string,
): Promise<PrismaTaskV2> {
	const existingTask = await prisma.taskV2.findUnique({
		where: { id: taskId },
		select: { projectId: true },
	});

	if (!existingTask) {
		throw new Error("Task not found");
	}

	// Verify access using existing task's projectId
	if (!(await isProjectUserOrHigher(existingTask.projectId, userId))) {
		throw new Error("Forbidden: You do not have write permissions in this project");
	}

	const updateData: any = {};
	if (request.title !== undefined) updateData.title = request.title;
	if (request.description !== undefined) updateData.description = request.description ?? null;
	if (request.xpAward !== undefined) updateData.xpAward = request.xpAward;
	if (request.category !== undefined) updateData.category = request.category;
	if (request.optional !== undefined) updateData.optional = request.optional;
	if (request.startDate !== undefined)
		updateData.startDate = request.startDate ? new Date(request.startDate) : null;
	if (request.startTime !== undefined) updateData.startTime = request.startTime ?? null;
	if (request.dueDate !== undefined)
		updateData.dueDate = request.dueDate ? new Date(request.dueDate) : null;
	if (request.dueTime !== undefined) updateData.dueTime = request.dueTime ?? null;
	if (request.status !== undefined) {
		updateData.status = request.status;
		if (request.status === "COMPLETED") {
			updateData.completedAt = new Date();
		} else if (request.status === "PENDING") {
			updateData.completedAt = null;
		}
	}

	const updatedTask = await prisma.taskV2.update({
		where: { id: taskId },
		data: updateData,
	});

	return updatedTask;
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
	const task = await prisma.taskV2.findUnique({
		where: { id: taskId },
		select: { projectId: true },
	});

	if (!task) {
		throw new Error("Task not found");
	}

	if (!(await isProjectAdmin(task.projectId, userId))) {
		throw new Error("Forbidden: You must be an admin to delete tasks in this project");
	}

	await prisma.taskV2.delete({
		where: { id: taskId },
	});
}

export function serializeTask(task: PrismaTaskV2): TaskV2 {
	return TaskV2Schema.parse({
		id: task.id,
		title: task.title,
		description: task.description,
		xpAward: task.xpAward,
		projectId: task.projectId,
		category: task.category,
		optional: task.optional,
		startDate: task.startDate?.toISOString() ?? null,
		startTime: task.startTime ?? null,
		dueDate: task.dueDate?.toISOString() ?? null,
		dueTime: task.dueTime ?? null,
		completedAt: task.completedAt?.toISOString() ?? null,
		status: task.status as "PENDING" | "COMPLETED",
		createdAt: task.createdAt.toISOString(),
		updatedAt: task.updatedAt.toISOString(),
	});
}
