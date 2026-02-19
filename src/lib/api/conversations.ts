import { ApiError } from "@pointwise/lib/api/errors";
import { areFriends } from "@pointwise/lib/api/friends";
import prisma from "@pointwise/lib/prisma";
import type {
	Conversation,
	ConversationListItem,
	CreateConversationInput,
	UpdateConversationInput,
} from "@pointwise/lib/validation/conversation-schema";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";

const participantInclude = {
	include: {
		user: {
			select: {
				id: true,
				displayName: true,
				image: true,
			},
		},
	},
};

/**
 * Ensure the user is a participant; throws ApiError 404 if not.
 * Exported for use by messages API.
 */
export async function ensureParticipant(
	conversationId: string,
	userId: string,
): Promise<{ conversationId: string; userId: string }> {
	const participant = await prisma.conversationParticipant.findUnique({
		where: {
			conversationId_userId: { conversationId, userId },
		},
	});
	if (!participant) {
		throw new ApiError("Conversation not found", 404);
	}
	return participant;
}

/**
 * True if the user is friends with at least one other participant (required to send messages).
 * Exported for use by messages API.
 */
export async function canUserSendInConversation(
	conversationId: string,
	userId: string,
): Promise<boolean> {
	const otherParticipants = await prisma.conversationParticipant.findMany({
		where: { conversationId, userId: { not: userId } },
		select: { userId: true },
	});
	if (otherParticipants.length === 0) return false;
	for (const { userId: otherId } of otherParticipants) {
		if (await areFriends(userId, otherId)) return true;
	}
	return false;
}

/**
 * List conversations for a user with last message and participant summary.
 */
export async function getConversations(
	userId: string,
): Promise<ConversationListItem[]> {
	const participants = await prisma.conversationParticipant.findMany({
		where: { userId },
		include: {
			conversation: {
				include: {
					participants: participantInclude,
					messages: {
						orderBy: { createdAt: "desc" },
						take: 1,
						select: {
							id: true,
							content: true,
							senderId: true,
							createdAt: true,
						},
					},
				},
			},
		},
		orderBy: { conversation: { updatedAt: "desc" } },
	});

	const list = participants.map((p) => {
		const conv = p.conversation;
		const lastMessage = conv.messages[0] ?? null;
		const archivedAt = (p as { archivedAt?: Date | null }).archivedAt ?? null;
		const item = {
			archivedAt,
			id: conv.id,
			name: conv.name,
			createdAt: conv.createdAt,
			updatedAt: conv.updatedAt,
			participants: conv.participants.map((part) => ({
				id: part.id,
				conversationId: part.conversationId,
				userId: part.userId,
				joinedAt: part.joinedAt,
				lastReadAt: part.lastReadAt,
				user: part.user ?? undefined,
			})),
			lastMessage: lastMessage
				? {
						id: lastMessage.id,
						content: lastMessage.content,
						senderId: lastMessage.senderId,
						createdAt: lastMessage.createdAt,
					}
				: null,
		};
		return item;
	});
	// Only return conversations that have at least one message (so new conversations don't show in list until first message is sent)
	const withMessages = list.filter((item) => item.lastMessage != null);
	// Do not filter by friendship: users can always see their conversation list (for reference/proof); only sending is restricted.
	// Hide archived conversations unless another participant sent a message after the user archived
	return withMessages
		.filter((item) => {
			const archivedAt = item.archivedAt;
			if (!archivedAt) return true;
			const lastMsg = item.lastMessage;
			if (!lastMsg) return false;
			return (
				lastMsg.senderId !== userId &&
				lastMsg.createdAt.getTime() > new Date(archivedAt).getTime()
			);
		})
		.map(({ archivedAt: _a, ...rest }) => rest);
}

/**
 * Create a conversation. If 1:1 with the same two users already exists, returns it.
 */
export async function createConversation(
	userId: string,
	input: CreateConversationInput,
): Promise<Conversation> {
	const { participantIds: rawIds, name } = input;
	const participantIds = [...new Set(rawIds)];
	const allUserIds = participantIds.includes(userId)
		? participantIds
		: [userId, ...participantIds];

	if (allUserIds.length < 2) {
		throw new ApiError("At least one other participant required", 400);
	}

	if (allUserIds.length === 2) {
		const otherUserId = allUserIds.find((id) => id !== userId);
		if (otherUserId) {
			const myParticipations = await prisma.conversationParticipant.findMany({
				where: { userId },
				include: {
					conversation: {
						include: { participants: participantInclude },
					},
				},
			});
			const existing = myParticipations.find(
				(p) =>
					p.conversation.participants.length === 2 &&
					p.conversation.participants.some(
						(part) => part.userId === otherUserId,
					),
			);
			if (existing) {
				return existing.conversation as Conversation;
			}
		}
	}

	const conversation = await prisma.conversation.create({
		data: {
			name: name ?? null,
			participants: {
				create: allUserIds.map((uid) => ({ userId: uid })),
			},
		},
		include: {
			participants: participantInclude,
		},
	});

	return conversation as Conversation;
}

/**
 * Get a single conversation; user must be a participant.
 */
export async function getConversation(
	conversationId: string,
	userId: string,
): Promise<Conversation> {
	await ensureParticipant(conversationId, userId);

	const conversation = await prisma.conversation.findUnique({
		where: { id: conversationId },
		include: {
			participants: participantInclude,
		},
	});

	if (!conversation) {
		throw new ApiError("Conversation not found", 404);
	}

	// Viewing is always allowed for participants; canSend only affects whether they can send (must be friends with at least one other participant).
	const canSend = await canUserSendInConversation(conversationId, userId);
	return { ...conversation, canSend } as Conversation;
}

/**
 * Update a conversation (name and/or add members); user must be a participant.
 */
export async function updateConversation(
	conversationId: string,
	userId: string,
	input: UpdateConversationInput,
): Promise<Conversation> {
	await ensureParticipant(conversationId, userId);

	const updates: { name?: string | null } = {};
	if (input.name !== undefined) {
		updates.name = input.name;
	}
	if (Object.keys(updates).length > 0) {
		await prisma.conversation.update({
			where: { id: conversationId },
			data: updates,
		});
	}

	if (input.addParticipantIds?.length) {
		const existing = await prisma.conversationParticipant.findMany({
			where: { conversationId },
			select: { userId: true },
		});
		const existingIds = new Set(existing.map((p) => p.userId));
		for (const uid of input.addParticipantIds) {
			if (!existingIds.has(uid)) {
				await prisma.conversationParticipant.create({
					data: { conversationId, userId: uid },
				});
				existingIds.add(uid);
			}
		}
	}

	const conversation = await prisma.conversation.findUnique({
		where: { id: conversationId },
		include: {
			participants: participantInclude,
		},
	});

	if (!conversation) {
		throw new ApiError("Conversation not found", 404);
	}
	return conversation as Conversation;
}

/**
 * Leave a conversation. If no participants remain, deletes the conversation.
 */
export async function leaveConversation(
	conversationId: string,
	userId: string,
): Promise<{ success: true }> {
	await ensureParticipant(conversationId, userId);

	await prisma.conversationParticipant.delete({
		where: {
			conversationId_userId: { conversationId, userId },
		},
	});

	const remaining = await prisma.conversationParticipant.count({
		where: { conversationId },
	});
	if (remaining === 0) {
		await prisma.conversation.delete({
			where: { id: conversationId },
		});
	}

	return { success: true };
}

/**
 * Archive a conversation for the current user. Hides it from the overview until another participant sends a message.
 */
export async function archiveConversation(
	conversationId: string,
	userId: string,
): Promise<{ success: true }> {
	await ensureParticipant(conversationId, userId);

	await prisma.conversationParticipant.update({
		where: {
			conversationId_userId: { conversationId, userId },
		},
		// archivedAt added to schema; Prisma client types update after `npx prisma generate`
		data: { archivedAt: new Date() } as Parameters<
			(typeof prisma.conversationParticipant)["update"]
		>[0]["data"],
	});

	return { success: true };
}

/**
 * Mark all NEW_MESSAGE notifications for this conversation as read for the user.
 * Uses MongoDB raw command to filter on the embedded `data.conversationId` field
 * instead of loading all unread message notifications into memory.
 */
export async function markConversationRead(
	conversationId: string,
	userId: string,
): Promise<{ success: true }> {
	await ensureParticipant(conversationId, userId);

	await prisma.$runCommandRaw({
		update: "Notification",
		updates: [
			{
				q: {
					userId: { $oid: userId },
					type: NotificationType.NEW_MESSAGE,
					read: false,
					"data.conversationId": conversationId,
				},
				u: { $set: { read: true } },
				multi: true,
			},
		],
	});

	return { success: true };
}
