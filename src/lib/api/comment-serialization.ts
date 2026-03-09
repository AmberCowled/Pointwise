import type { Comment, Reply } from "@pointwise/lib/validation/comments-schema";

// ── Prisma includes ─────────────────────────────────────────────────

export const commentInclude = {
	author: { select: { id: true, displayName: true, image: true } },
	commentLikes: { select: { userId: true } },
	replyThread: { include: { _count: { select: { comments: true } } } },
} as const;

export const replyInclude = {
	author: { select: { id: true, displayName: true, image: true } },
	commentLikes: { select: { userId: true } },
} as const;

// ── Serialization ───────────────────────────────────────────────────

export function serializeComment(
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

export function serializeReply(
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
