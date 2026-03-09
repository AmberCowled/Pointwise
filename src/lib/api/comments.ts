import {
	commentInclude,
	replyInclude,
	serializeComment,
	serializeReply,
} from "@pointwise/lib/api/comment-serialization";
import {
	getProjectMemberIds,
	isProjectAdmin,
	verifyProjectAccess,
} from "@pointwise/lib/api/projects";
import { truncateMessageSnippet } from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { Comment, Reply } from "@pointwise/lib/validation/comments-schema";

// ── Recipient resolution ────────────────────────────────────────────

/**
 * Resolve all users interested in task comments:
 * task assignees + project admins + all comment authors on the task.
 */
export async function resolveTaskCommentRecipients(
	taskId: string,
): Promise<string[]> {
	const userIds = new Set<string>();

	const [task, threads] = await Promise.all([
		prisma.task.findUnique({
			where: { id: taskId },
			select: { assignedUserIds: true, projectId: true },
		}),
		prisma.commentThread.findMany({
			where: { taskId },
			select: { comments: { select: { authorId: true } } },
		}),
	]);

	if (task) {
		for (const id of task.assignedUserIds) userIds.add(id);
		const project = await prisma.project.findUnique({
			where: { id: task.projectId },
			select: { adminUserIds: true },
		});
		if (project) {
			for (const id of project.adminUserIds) userIds.add(id);
		}
	}

	for (const thread of threads) {
		for (const c of thread.comments) userIds.add(c.authorId);
	}

	return [...userIds];
}

// ── Thread helpers ──────────────────────────────────────────────────

export async function getOrCreateBaseThread(taskId: string) {
	return prisma.commentThread.upsert({
		where: { taskId },
		create: { taskId },
		update: {},
	});
}

export async function getOrCreateReplyThread(parentCommentId: string) {
	return prisma.commentThread.upsert({
		where: { parentCommentId },
		create: { parentCommentId },
		update: {},
	});
}

// ── Top-level comments ──────────────────────────────────────────────

export async function getComments(
	taskId: string,
	projectId: string,
	userId: string,
): Promise<Comment[]> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const thread = await prisma.commentThread.findUnique({
		where: { taskId },
	});
	if (!thread) return [];

	const comments = await prisma.comment.findMany({
		where: { threadId: thread.id },
		include: commentInclude,
		orderBy: { createdAt: "asc" },
	});

	return comments.map((c) => serializeComment(c, userId));
}

export async function createComment(
	taskId: string,
	projectId: string,
	userId: string,
	content: string,
): Promise<Comment> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const thread = await getOrCreateBaseThread(taskId);

	const comment = await prisma.comment.create({
		data: { threadId: thread.id, authorId: userId, content },
		include: commentInclude,
	});

	await prisma.task.update({
		where: { id: taskId },
		data: { commentCount: { increment: 1 } },
	});

	const serialized = serializeComment(comment, userId);

	try {
		const memberIds = await getProjectMemberIds(projectId);
		const eventRecipients = memberIds.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_CREATED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					taskId,
					parentCommentId: null,
					comment: serialized,
				},
				eventRecipients,
			);
			await emitEvent("TASK_MUTATED", { projectId }, eventRecipients);
		}
	} catch (error) {
		logDispatchError("task comment create", error);
	}

	// Send TASK_COMMENT_RECEIVED notification to interested users (excluding author)
	try {
		const recipients = await resolveTaskCommentRecipients(taskId);
		const filtered = recipients.filter((id) => id !== userId);
		if (filtered.length > 0) {
			const task = await prisma.task.findUnique({
				where: { id: taskId },
				select: {
					title: true,
					projectId: true,
					project: { select: { name: true } },
				},
			});
			if (task) {
				await dispatch(
					"TASK_COMMENT_RECEIVED",
					userId,
					{
						taskId,
						taskName: task.title,
						projectId: task.projectId,
						projectName: task.project.name,
						commentId: serialized.id,
						commentSnippet: truncateMessageSnippet(content),
						isReply: false,
					},
					filtered,
				);
			}
		}
	} catch (error) {
		logDispatchError("task comment notification", error);
	}

	return serialized;
}

// ── Replies ─────────────────────────────────────────────────────────

export async function getReplies(
	parentCommentId: string,
	taskId: string,
	projectId: string,
	userId: string,
): Promise<Reply[]> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	// Verify the parent comment belongs to this task's base thread
	const baseThread = await prisma.commentThread.findUnique({
		where: { taskId },
	});
	if (!baseThread) return [];

	const parentComment = await prisma.comment.findFirst({
		where: { id: parentCommentId, threadId: baseThread.id },
	});
	if (!parentComment) {
		throw new Error("Parent comment not found in this task");
	}

	const replyThread = await prisma.commentThread.findUnique({
		where: { parentCommentId },
	});
	if (!replyThread) return [];

	const replies = await prisma.comment.findMany({
		where: { threadId: replyThread.id },
		include: replyInclude,
		orderBy: { createdAt: "asc" },
	});

	return replies.map((r) => serializeReply(r, userId));
}

export async function createReply(
	parentCommentId: string,
	taskId: string,
	projectId: string,
	userId: string,
	content: string,
): Promise<Reply> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	// Verify the parent comment belongs to this task's base thread
	const baseThread = await prisma.commentThread.findUnique({
		where: { taskId },
	});
	if (!baseThread) {
		throw new Error("Task has no comments yet");
	}

	const parentComment = await prisma.comment.findFirst({
		where: { id: parentCommentId, threadId: baseThread.id },
	});
	if (!parentComment) {
		throw new Error("Parent comment not found in this task");
	}

	const replyThread = await getOrCreateReplyThread(parentCommentId);

	const reply = await prisma.comment.create({
		data: { threadId: replyThread.id, authorId: userId, content },
		include: replyInclude,
	});

	await prisma.task.update({
		where: { id: taskId },
		data: { commentCount: { increment: 1 } },
	});

	const serialized = serializeReply(reply, userId);

	try {
		const memberIds = await getProjectMemberIds(projectId);
		const eventRecipients = memberIds.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_CREATED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					taskId,
					parentCommentId,
					comment: serialized,
				},
				eventRecipients,
			);
			await emitEvent("TASK_MUTATED", { projectId }, eventRecipients);
		}
	} catch (error) {
		logDispatchError("task reply create", error);
	}

	// Send TASK_COMMENT_RECEIVED notification (isReply: true)
	try {
		const recipients = await resolveTaskCommentRecipients(taskId);
		const filtered = recipients.filter((id) => id !== userId);
		if (filtered.length > 0) {
			const task = await prisma.task.findUnique({
				where: { id: taskId },
				select: {
					title: true,
					projectId: true,
					project: { select: { name: true } },
				},
			});
			if (task) {
				await dispatch(
					"TASK_COMMENT_RECEIVED",
					userId,
					{
						taskId,
						taskName: task.title,
						projectId: task.projectId,
						projectName: task.project.name,
						commentId: serialized.id,
						commentSnippet: truncateMessageSnippet(content),
						isReply: true,
					},
					filtered,
				);
			}
		}
	} catch (error) {
		logDispatchError("task reply notification", error);
	}

	return serialized;
}

// ── Edit / Delete ───────────────────────────────────────────────────

export async function editComment(
	commentId: string,
	taskId: string,
	projectId: string,
	userId: string,
	content: string,
): Promise<Comment | Reply> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		include: { thread: true },
	});
	if (!comment) {
		throw new Error("Comment not found");
	}
	if (comment.authorId !== userId) {
		throw new Error("Forbidden: Only the author can edit this comment");
	}

	// Verify comment belongs to this task (either base thread or a reply thread of a base thread comment)
	const baseThread = await prisma.commentThread.findUnique({
		where: { taskId },
	});
	if (!baseThread) {
		throw new Error("Comment does not belong to this task");
	}

	const isTopLevel = comment.threadId === baseThread.id;
	if (!isTopLevel) {
		// Check that the reply thread belongs to a comment in the base thread
		const replyThread = await prisma.commentThread.findUnique({
			where: { id: comment.threadId },
			select: { parentCommentId: true },
		});
		if (!replyThread?.parentCommentId) {
			throw new Error("Comment does not belong to this task");
		}
		const parentInBase = await prisma.comment.findFirst({
			where: { id: replyThread.parentCommentId, threadId: baseThread.id },
		});
		if (!parentInBase) {
			throw new Error("Comment does not belong to this task");
		}
	}

	const updated = await prisma.comment.update({
		where: { id: commentId },
		data: { content, editedAt: new Date() },
		include: isTopLevel ? commentInclude : replyInclude,
	});

	const serialized = isTopLevel
		? serializeComment(
				updated as typeof updated & {
					replyThread: { _count: { comments: number } } | null;
				},
				userId,
			)
		: serializeReply(updated, userId);

	try {
		const memberIds = await getProjectMemberIds(projectId);
		const eventRecipients = memberIds.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_EDITED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					taskId,
					parentCommentId: isTopLevel ? null : comment.threadId,
					comment: serialized,
				},
				eventRecipients,
			);
		}
	} catch (error) {
		logDispatchError("task comment edit", error);
	}

	return serialized;
}

export async function deleteComment(
	commentId: string,
	taskId: string,
	projectId: string,
	userId: string,
): Promise<void> {
	if (!(await verifyProjectAccess(projectId, userId))) {
		throw new Error("Forbidden: You do not have access to this project");
	}

	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		include: { thread: true },
	});
	if (!comment) {
		throw new Error("Comment not found");
	}

	// Must be author or project admin
	const isAuthor = comment.authorId === userId;
	const isAdmin = await isProjectAdmin(projectId, userId);
	if (!isAuthor && !isAdmin) {
		throw new Error(
			"Forbidden: Only the author or a project admin can delete this comment",
		);
	}

	// Verify comment belongs to this task
	const baseThread = await prisma.commentThread.findUnique({
		where: { taskId },
	});
	if (!baseThread) {
		throw new Error("Comment does not belong to this task");
	}

	const isTopLevel = comment.threadId === baseThread.id;
	let decrementCount = 1;

	if (isTopLevel) {
		// If top-level, count replies in the reply thread (if any) and delete the reply thread
		const replyThread = await prisma.commentThread.findUnique({
			where: { parentCommentId: commentId },
			include: { _count: { select: { comments: true } } },
		});
		if (replyThread) {
			decrementCount += replyThread._count.comments;
			// Delete all replies first, then the thread
			await prisma.comment.deleteMany({
				where: { threadId: replyThread.id },
			});
			await prisma.commentThread.delete({
				where: { id: replyThread.id },
			});
		}
	} else {
		// Verify this reply thread belongs to a comment in the base thread
		const replyThread = await prisma.commentThread.findUnique({
			where: { id: comment.threadId },
			select: { parentCommentId: true },
		});
		if (!replyThread?.parentCommentId) {
			throw new Error("Comment does not belong to this task");
		}
	}

	await prisma.comment.delete({ where: { id: commentId } });

	await prisma.task.update({
		where: { id: taskId },
		data: { commentCount: { decrement: decrementCount } },
	});

	try {
		const memberIds = await getProjectMemberIds(projectId);
		const eventRecipients = memberIds.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_DELETED",
				{
					commentId,
					threadId: comment.threadId,
					taskId,
					parentCommentId: isTopLevel ? null : comment.threadId,
					comment: null,
				},
				eventRecipients,
			);
			await emitEvent("TASK_MUTATED", { projectId }, eventRecipients);
		}
	} catch (error) {
		logDispatchError("task comment delete", error);
	}
}

// ── Likes ───────────────────────────────────────────────────────────

export async function likeComment(
	commentId: string,
	userId: string,
): Promise<void> {
	await prisma.commentLike.upsert({
		where: { commentId_userId: { commentId, userId } },
		create: { commentId, userId },
		update: {},
	});
}

export async function unlikeComment(
	commentId: string,
	userId: string,
): Promise<void> {
	await prisma.commentLike.deleteMany({
		where: { commentId, userId },
	});
}
