import prisma from "@pointwise/lib/prisma";
import type { Post } from "@pointwise/lib/validation/posts-schema";

// ── Serialization ───────────────────────────────────────────────────

function serializePost(
	post: {
		id: string;
		authorId: string;
		author: { id: string; displayName: string; image: string | null };
		content: string;
		editedAt: Date | null;
		createdAt: Date;
		commentCount: number;
		postLikes: { userId: string }[];
	},
	requesterId: string,
): Post {
	return {
		id: post.id,
		authorId: post.authorId,
		author: {
			id: post.author.id,
			displayName: post.author.displayName,
			image: post.author.image,
		},
		content: post.content,
		editedAt: post.editedAt?.toISOString() ?? null,
		createdAt: post.createdAt.toISOString(),
		likeCount: post.postLikes.length,
		likedByCurrentUser: post.postLikes.some((l) => l.userId === requesterId),
		commentCount: post.commentCount,
	};
}

const postInclude = {
	author: { select: { id: true, displayName: true, image: true } },
	postLikes: { select: { userId: true } },
} as const;

// ── Posts CRUD ───────────────────────────────────────────────────────

export async function getPosts(
	profileUserId: string,
	requesterId: string,
): Promise<Post[]> {
	// Check profile visibility
	const user = await prisma.user.findUnique({
		where: { id: profileUserId },
		select: { profileVisibility: true },
	});
	if (!user) throw new Error("User not found");

	const isOwn = profileUserId === requesterId;
	if (user.profileVisibility === "PRIVATE" && !isOwn) {
		return [];
	}

	const posts = await prisma.post.findMany({
		where: { authorId: profileUserId },
		include: postInclude,
		orderBy: { createdAt: "desc" },
	});

	return posts.map((p) => serializePost(p, requesterId));
}

export async function createPost(
	authorId: string,
	content: string,
): Promise<Post> {
	const post = await prisma.post.create({
		data: { authorId, content },
		include: postInclude,
	});
	return serializePost(post, authorId);
}

export async function editPost(
	postId: string,
	userId: string,
	content: string,
): Promise<Post> {
	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { authorId: true },
	});
	if (!post) throw new Error("Post not found");
	if (post.authorId !== userId) {
		throw new Error("Forbidden: Only the author can edit this post");
	}

	const updated = await prisma.post.update({
		where: { id: postId },
		data: { content, editedAt: new Date() },
		include: postInclude,
	});
	return serializePost(updated, userId);
}

export async function deletePost(
	postId: string,
	userId: string,
): Promise<void> {
	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { authorId: true },
	});
	if (!post) throw new Error("Post not found");
	if (post.authorId !== userId) {
		throw new Error("Forbidden: Only the author can delete this post");
	}

	// Delete associated comment thread and comments (cascade handles most)
	const thread = await prisma.commentThread.findFirst({
		where: { postId },
	});
	if (thread) {
		// Delete reply threads for all top-level comments
		const topLevelComments = await prisma.comment.findMany({
			where: { threadId: thread.id },
			select: { id: true },
		});
		for (const comment of topLevelComments) {
			const replyThread = await prisma.commentThread.findUnique({
				where: { parentCommentId: comment.id },
			});
			if (replyThread) {
				await prisma.comment.deleteMany({
					where: { threadId: replyThread.id },
				});
				await prisma.commentThread.delete({ where: { id: replyThread.id } });
			}
		}
		await prisma.comment.deleteMany({ where: { threadId: thread.id } });
		await prisma.commentThread.delete({ where: { id: thread.id } });
	}

	await prisma.post.delete({ where: { id: postId } });
}

// ── Likes ───────────────────────────────────────────────────────────

export async function likePost(postId: string, userId: string): Promise<void> {
	await prisma.postLike.upsert({
		where: { postId_userId: { postId, userId } },
		create: { postId, userId },
		update: {},
	});
}

export async function unlikePost(
	postId: string,
	userId: string,
): Promise<void> {
	await prisma.postLike.deleteMany({
		where: { postId, userId },
	});
}
