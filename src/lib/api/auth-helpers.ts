/**
 * Authorization helper functions for API routes
 */

import type { Prisma, Task, User } from "@prisma/client";

/**
 * Result of task ownership verification
 */
export type TaskOwnershipResult =
	| {
			success: true;
			task: Task;
			user: User;
	  }
	| {
			success: false;
			status: 404 | 403;
			message: string;
	  };

/**
 * Verify that a task belongs to the authenticated user
 *
 * This function performs an efficient ownership check by:
 * 1. Fetching the task by ID
 * 2. Fetching the user by email
 * 3. Comparing task.userId with user.id
 *
 * This is more efficient than using `findFirst` with nested user check
 * because it allows Prisma to optimize the queries separately.
 *
 * @param tx - Prisma transaction client
 * @param taskId - Task ID to verify
 * @param userEmail - Authenticated user's email
 * @returns Ownership verification result with task and user if successful
 *
 * @example
 * ```typescript
 * const result = await verifyTaskOwnership(tx, taskId, email);
 * if (!result.success) {
 *   return errorResponse(result.message, result.status);
 * }
 * const { task, user } = result;
 * // Proceed with authorized operation
 * ```
 */
export async function verifyTaskOwnership(
	tx: Prisma.TransactionClient,
	taskId: string,
	userEmail: string,
): Promise<TaskOwnershipResult> {
	// Fetch task and user in parallel for better performance
	const [task, user] = await Promise.all([
		tx.task.findUnique({
			where: { id: taskId },
		}),
		tx.user.findUnique({
			where: { email: userEmail },
			select: { id: true },
		}),
	]);

	if (!task) {
		return {
			success: false,
			status: 404,
			message: "Task not found",
		};
	}

	if (!user) {
		return {
			success: false,
			status: 403,
			message: "User not found",
		};
	}

	if (task.userId !== user.id) {
		return {
			success: false,
			status: 403,
			message: "Forbidden",
		};
	}

	return {
		success: true,
		task,
		user: user as User, // Type assertion needed because we only selected id
	};
}

/**
 * Verify task ownership with custom select fields
 *
 * Similar to `verifyTaskOwnership` but allows selecting specific task fields.
 * Useful when you only need certain fields from the task.
 *
 * @param tx - Prisma transaction client
 * @param taskId - Task ID to verify
 * @param userEmail - Authenticated user's email
 * @param select - Fields to select from task
 * @returns Ownership verification result with selected task fields
 *
 * @example
 * ```typescript
 * const result = await verifyTaskOwnershipWithSelect(
 *   tx,
 *   taskId,
 *   email,
 *   { id: true, userId: true, title: true, xpValue: true }
 * );
 * ```
 */
export async function verifyTaskOwnershipWithSelect<T extends Prisma.TaskSelect & { userId: true }>(
	tx: Prisma.TransactionClient,
	taskId: string,
	userEmail: string,
	select: T,
): Promise<
	| {
			success: true;
			task: Prisma.TaskGetPayload<{ select: T }>;
			user: { id: string };
	  }
	| {
			success: false;
			status: 404 | 403;
			message: string;
	  }
> {
	const [task, user] = await Promise.all([
		tx.task.findUnique({
			where: { id: taskId },
			select,
		}),
		tx.user.findUnique({
			where: { email: userEmail },
			select: { id: true },
		}),
	]);

	if (!task) {
		return {
			success: false,
			status: 404,
			message: "Task not found",
		};
	}

	if (!user) {
		return {
			success: false,
			status: 403,
			message: "User not found",
		};
	}

	// TypeScript now knows task has userId because of the type constraint
	// Use type assertion since we've verified userId is in the select
	const taskWithUserId = task as unknown as Prisma.TaskGetPayload<{
		select: T;
	}> & {
		userId: string;
	};

	if (taskWithUserId.userId !== user.id) {
		return {
			success: false,
			status: 403,
			message: "Forbidden",
		};
	}

	return {
		success: true,
		task,
		user,
	};
}
