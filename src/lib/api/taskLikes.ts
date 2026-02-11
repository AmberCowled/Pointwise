import prisma from "@pointwise/lib/prisma";
import type { TaskLike as PrismaTaskLike } from "@prisma/client";

export async function likeTask(
	taskId: string,
	userId: string,
): Promise<PrismaTaskLike> {
	const task = await prisma.task.findUnique({
		where: { id: taskId },
	});

	if (!task) {
		throw new Error("Task not found");
	}

	const existing = await prisma.taskLike.findUnique({
		where: {
			taskId_userId: { taskId, userId },
		},
	});

	if (existing) {
		return existing;
	}

	return prisma.taskLike.create({
		data: { taskId, userId },
	});
}

export async function unlikeTask(
	taskId: string,
	userId: string,
): Promise<void> {
	const task = await prisma.task.findUnique({
		where: { id: taskId },
	});

	if (!task) {
		throw new Error("Task not found");
	}

	await prisma.taskLike.deleteMany({
		where: { taskId, userId },
	});
}
