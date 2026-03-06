import {
	getOrCreateReplyThread,
	likeComment,
	unlikeComment,
} from "@pointwise/lib/api/comments";
import prisma from "@pointwise/lib/prisma";
import { publishPostCommentEvent } from "@pointwise/lib/realtime/publish";
import { RealtimeEvents } from "@pointwise/lib/realtime/registry";
import type { Comment, Reply } from "@pointwise/lib/validation/comments-schema";

// ── Thread helpers ──────────────────────────────────────────────────

export async function getOrCreatePostThread(postId: string) {
	const existing = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (existing) return existing;
	return prisma.commentThread.create({ data: { postId } });
}

// ── Serialization ───────────────────────────────────────────────────

function serializeComment(
	comment: {
		id: string;
		threadId: string;
		authorId: string;
		author: { id: string; displayName: string; image: string | null };
		content: string;
		editedAt: Date | null;
		createdAt: Date;
		commentLikes: { userId: string }[];
		replyThread?: { _count: { comments: number } } | null;
	},
	userId: string,
): Comment {
	return {
		id: comment.id,
		threadId: comment.threadId,
		authorId: comment.authorId,
		author: {
			id: comment.author.id,
			displayName: comment.author.displayName,
			image: comment.author.image,
		},
		content: comment.content,
		editedAt: comment.editedAt?.toISOString() ?? null,
		createdAt: comment.createdAt.toISOString(),
		likeCount: comment.commentLikes.length,
		likedByCurrentUser: comment.commentLikes.some((l) => l.userId === userId),
		replyCount: comment.replyThread?._count?.comments ?? 0,
	};
}

function serializeReply(
	comment: {
		id: string;
		threadId: string;
		authorId: string;
		author: { id: string; displayName: string; image: string | null };
		content: string;
		editedAt: Date | null;
		createdAt: Date;
		commentLikes: { userId: string }[];
	},
	userId: string,
): Reply {
	return {
		id: comment.id,
		threadId: comment.threadId,
		authorId: comment.authorId,
		author: {
			id: comment.author.id,
			displayName: comment.author.displayName,
			image: comment.author.image,
		},
		content: comment.content,
		editedAt: comment.editedAt?.toISOString() ?? null,
		createdAt: comment.createdAt.toISOString(),
		likeCount: comment.commentLikes.length,
		likedByCurrentUser: comment.commentLikes.some((l) => l.userId === userId),
	};
}

// ── Includes ────────────────────────────────────────────────────────

const commentInclude = {
	author: { select: { id: true, displayName: true, image: true } },
	commentLikes: { select: { userId: true } },
	replyThread: { include: { _count: { select: { comments: true } } } },
} as const;

const replyInclude = {
	author: { select: { id: true, displayName: true, image: true } },
	commentLikes: { select: { userId: true } },
} as const;

// ── Top-level comments ──────────────────────────────────────────────

export async function getPostComments(
	postId: string,
	userId: string,
): Promise<Comment[]> {
	const thread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (!thread) return [];

	const comments = await prisma.comment.findMany({
		where: { threadId: thread.id },
		include: commentInclude,
		orderBy: { createdAt: "asc" },
	});

	return comments.map((c) => serializeComment(c, userId));
}

export async function createPostComment(
	postId: string,
	userId: string,
	content: string,
): Promise<Comment> {
	const thread = await getOrCreatePostThread(postId);

	const comment = await prisma.comment.create({
		data: { threadId: thread.id, authorId: userId, content },
		include: commentInclude,
	});

	await prisma.post.update({
		where: { id: postId },
		data: { commentCount: { increment: 1 } },
	});

	const serialized = serializeComment(comment, userId);

	try {
		await publishPostCommentEvent(postId, RealtimeEvents.COMMENT_CREATED, {
			commentId: serialized.id,
			threadId: serialized.threadId,
			postId,
			parentCommentId: null,
			comment: serialized,
		});
	} catch (_e) {
		// Non-critical
	}

	return serialized;
}

// ── Replies ─────────────────────────────────────────────────────────

export async function getPostReplies(
	parentCommentId: string,
	postId: string,
	userId: string,
): Promise<Reply[]> {
	const baseThread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (!baseThread) return [];

	const parentComment = await prisma.comment.findFirst({
		where: { id: parentCommentId, threadId: baseThread.id },
	});
	if (!parentComment) {
		throw new Error("Parent comment not found in this post");
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

export async function createPostReply(
	parentCommentId: string,
	postId: string,
	userId: string,
	content: string,
): Promise<Reply> {
	const baseThread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (!baseThread) {
		throw new Error("Post has no comments yet");
	}

	const parentComment = await prisma.comment.findFirst({
		where: { id: parentCommentId, threadId: baseThread.id },
	});
	if (!parentComment) {
		throw new Error("Parent comment not found in this post");
	}

	const replyThread = await getOrCreateReplyThread(parentCommentId);

	const reply = await prisma.comment.create({
		data: { threadId: replyThread.id, authorId: userId, content },
		include: replyInclude,
	});

	await prisma.post.update({
		where: { id: postId },
		data: { commentCount: { increment: 1 } },
	});

	const serialized = serializeReply(reply, userId);

	try {
		await publishPostCommentEvent(postId, RealtimeEvents.COMMENT_CREATED, {
			commentId: serialized.id,
			threadId: serialized.threadId,
			postId,
			parentCommentId,
			comment: serialized,
		});
	} catch (_e) {
		// Non-critical
	}

	return serialized;
}

// ── Edit / Delete ───────────────────────────────────────────────────

export async function editPostComment(
	commentId: string,
	postId: string,
	userId: string,
	content: string,
): Promise<Comment | Reply> {
	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		include: { thread: true },
	});
	if (!comment) throw new Error("Comment not found");
	if (comment.authorId !== userId) {
		throw new Error("Forbidden: Only the author can edit this comment");
	}

	const baseThread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (!baseThread) throw new Error("Comment does not belong to this post");

	const isTopLevel = comment.threadId === baseThread.id;
	if (!isTopLevel) {
		const replyThread = await prisma.commentThread.findUnique({
			where: { id: comment.threadId },
			select: { parentCommentId: true },
		});
		if (!replyThread?.parentCommentId) {
			throw new Error("Comment does not belong to this post");
		}
		const parentInBase = await prisma.comment.findFirst({
			where: { id: replyThread.parentCommentId, threadId: baseThread.id },
		});
		if (!parentInBase) {
			throw new Error("Comment does not belong to this post");
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
		await publishPostCommentEvent(postId, RealtimeEvents.COMMENT_EDITED, {
			commentId: serialized.id,
			threadId: serialized.threadId,
			postId,
			parentCommentId: isTopLevel ? null : comment.threadId,
			comment: serialized,
		});
	} catch (_e) {
		// Non-critical
	}

	return serialized;
}

export async function deletePostComment(
	commentId: string,
	postId: string,
	userId: string,
): Promise<void> {
	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		include: { thread: true },
	});
	if (!comment) throw new Error("Comment not found");
	if (comment.authorId !== userId) {
		throw new Error("Forbidden: Only the author can delete this comment");
	}

	const baseThread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (!baseThread) throw new Error("Comment does not belong to this post");

	const isTopLevel = comment.threadId === baseThread.id;
	let decrementCount = 1;

	if (isTopLevel) {
		const replyThread = await prisma.commentThread.findUnique({
			where: { parentCommentId: commentId },
			include: { _count: { select: { comments: true } } },
		});
		if (replyThread) {
			decrementCount += replyThread._count.comments;
			await prisma.comment.deleteMany({
				where: { threadId: replyThread.id },
			});
			await prisma.commentThread.delete({
				where: { id: replyThread.id },
			});
		}
	} else {
		const replyThread = await prisma.commentThread.findUnique({
			where: { id: comment.threadId },
			select: { parentCommentId: true },
		});
		if (!replyThread?.parentCommentId) {
			throw new Error("Comment does not belong to this post");
		}
	}

	await prisma.comment.delete({ where: { id: commentId } });

	await prisma.post.update({
		where: { id: postId },
		data: { commentCount: { decrement: decrementCount } },
	});

	try {
		await publishPostCommentEvent(postId, RealtimeEvents.COMMENT_DELETED, {
			commentId,
			threadId: comment.threadId,
			postId,
			parentCommentId: isTopLevel ? null : comment.threadId,
			comment: null,
		});
	} catch (_e) {
		// Non-critical
	}
}

// ── Re-export comment likes (entity-agnostic) ──────────────────────

export { likeComment as likePostComment, unlikeComment as unlikePostComment };
