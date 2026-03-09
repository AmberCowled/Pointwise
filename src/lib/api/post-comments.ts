import {
	commentInclude,
	replyInclude,
	serializeComment,
	serializeReply,
} from "@pointwise/lib/api/comment-serialization";
import {
	getOrCreateReplyThread,
	likeComment,
	unlikeComment,
} from "@pointwise/lib/api/comments";
import { truncateMessageSnippet } from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { Comment, Reply } from "@pointwise/lib/validation/comments-schema";

// ── Recipient resolution ────────────────────────────────────────────

/**
 * Resolve all users interested in post comments:
 * post author + all comment authors on the post.
 */
export async function resolvePostCommentRecipients(
	postId: string,
): Promise<string[]> {
	const userIds = new Set<string>();

	const [post, threads] = await Promise.all([
		prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		}),
		prisma.commentThread.findMany({
			where: { postId },
			select: { comments: { select: { authorId: true } } },
		}),
	]);

	if (post) {
		userIds.add(post.authorId);
	}

	for (const thread of threads) {
		for (const c of thread.comments) userIds.add(c.authorId);
	}

	return [...userIds];
}

// ── Thread helpers ──────────────────────────────────────────────────

export async function getOrCreatePostThread(postId: string) {
	const existing = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (existing) return existing;
	return prisma.commentThread.create({ data: { postId } });
}

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
		const recipients = await resolvePostCommentRecipients(postId);
		const eventRecipients = recipients.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_CREATED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					postId,
					parentCommentId: null,
					comment: serialized,
				},
				eventRecipients,
			);
		}
	} catch (error) {
		logDispatchError("post comment create", error);
	}

	// Send POST_COMMENT_RECEIVED notification (excluding author)
	try {
		const recipients = await resolvePostCommentRecipients(postId);
		const filtered = recipients.filter((id) => id !== userId);
		if (filtered.length > 0) {
			await dispatch(
				"POST_COMMENT_RECEIVED",
				userId,
				{
					postId,
					commentId: serialized.id,
					commentSnippet: truncateMessageSnippet(content),
					isReply: false,
				},
				filtered,
			);
		}
	} catch (error) {
		logDispatchError("post comment notification", error);
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
		const recipients = await resolvePostCommentRecipients(postId);
		const eventRecipients = recipients.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_CREATED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					postId,
					parentCommentId,
					comment: serialized,
				},
				eventRecipients,
			);
		}
	} catch (error) {
		logDispatchError("post reply create", error);
	}

	// Send POST_COMMENT_RECEIVED notification (isReply: true)
	try {
		const recipients = await resolvePostCommentRecipients(postId);
		const filtered = recipients.filter((id) => id !== userId);
		if (filtered.length > 0) {
			await dispatch(
				"POST_COMMENT_RECEIVED",
				userId,
				{
					postId,
					commentId: serialized.id,
					commentSnippet: truncateMessageSnippet(content),
					isReply: true,
				},
				filtered,
			);
		}
	} catch (error) {
		logDispatchError("post reply notification", error);
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
		const recipients = await resolvePostCommentRecipients(postId);
		const eventRecipients = recipients.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_EDITED",
				{
					commentId: serialized.id,
					threadId: serialized.threadId,
					postId,
					parentCommentId: isTopLevel ? null : comment.threadId,
					comment: serialized,
				},
				eventRecipients,
			);
		}
	} catch (error) {
		logDispatchError("post comment edit", error);
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
		const recipients = await resolvePostCommentRecipients(postId);
		const eventRecipients = recipients.filter((id) => id !== userId);
		if (eventRecipients.length > 0) {
			await emitEvent(
				"COMMENT_DELETED",
				{
					commentId,
					threadId: comment.threadId,
					postId,
					parentCommentId: isTopLevel ? null : comment.threadId,
					comment: null,
				},
				eventRecipients,
			);
		}
	} catch (error) {
		logDispatchError("post comment delete", error);
	}
}

// ── Re-export comment likes (entity-agnostic) ──────────────────────

export { likeComment as likePostComment, unlikeComment as unlikePostComment };
