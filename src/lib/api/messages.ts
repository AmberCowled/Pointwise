import {
	canUserSendInConversation,
	ensureParticipant,
} from "@pointwise/lib/api/conversations";
import { ApiError } from "@pointwise/lib/api/errors";
import {
	sendNotification,
	truncateMessageSnippet,
} from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import { publishNewMessage } from "@pointwise/lib/realtime/publish";
import type {
	Message,
	MessagesResponse,
	SendMessageInput,
} from "@pointwise/lib/validation/message-schema";
import { NotificationType } from "@pointwise/lib/validation/notification-schema";

const messageWithSender = {
	include: {
		sender: {
			select: {
				id: true,
				displayName: true,
				image: true,
			},
		},
	},
};

export type GetMessagesOptions = {
	cursor?: string;
	limit?: number;
};

/**
 * Get paginated messages for a conversation; user must be a participant.
 */
export async function getMessages(
	conversationId: string,
	userId: string,
	options: GetMessagesOptions = {},
): Promise<MessagesResponse> {
	await ensureParticipant(conversationId, userId);

	const limit = Math.min(options.limit ?? 50, 100);
	const cursor = options.cursor;

	const cursorMessage = cursor
		? await prisma.message.findFirst({
				where: { id: cursor, conversationId },
				select: { createdAt: true },
			})
		: null;

	const messages = await prisma.message.findMany({
		where: {
			conversationId,
			...(cursorMessage && {
				createdAt: { lt: cursorMessage.createdAt },
			}),
		},
		orderBy: { createdAt: "desc" },
		take: limit + 1,
		...messageWithSender,
	});

	const hasMore = messages.length > limit;
	const list = hasMore ? messages.slice(0, limit) : messages;
	const lastItem = list[list.length - 1];
	const nextCursor = hasMore && lastItem ? lastItem.id : null;
	const ordered = [...list].reverse();

	return {
		messages: ordered.map((m) => ({
			id: m.id,
			conversationId: m.conversationId,
			senderId: m.senderId,
			content: m.content,
			createdAt: m.createdAt,
			sender: m.sender ?? undefined,
		})),
		nextCursor,
	};
}

export type SenderInfo = {
	name: string | null;
	image: string | null;
};

/**
 * Send a message. Creates the message, NEW_MESSAGE notifications for other participants,
 * and publishes to Ably (user channel per recipient + conversation channel).
 */
export async function sendMessage(
	conversationId: string,
	userId: string,
	input: SendMessageInput,
	senderInfo: SenderInfo,
): Promise<Message> {
	await ensureParticipant(conversationId, userId);

	const canSend = await canUserSendInConversation(conversationId, userId);
	if (!canSend) {
		throw new ApiError(
			"You must be friends with at least one participant to send a message",
			403,
		);
	}

	const content = input.content.trim();
	const sender = await prisma.user.findUnique({
		where: { id: userId },
		select: { displayName: true, image: true },
	});

	const message = await prisma.message.create({
		data: {
			conversationId,
			senderId: userId,
			content,
		},
		...messageWithSender,
	});

	await prisma.conversation.update({
		where: { id: conversationId },
		data: { updatedAt: new Date() },
	});

	const snippet = truncateMessageSnippet(message.content);
	const otherParticipants = await prisma.conversationParticipant.findMany({
		where: { conversationId, userId: { not: userId } },
		select: { userId: true },
	});

	const newMessageData = {
		conversationId,
		senderId: userId,
		senderName: sender?.displayName ?? senderInfo.name ?? null,
		senderImage: sender?.image ?? senderInfo.image ?? null,
		messageSnippet: snippet,
		messageId: message.id,
	};

	for (const { userId: recipientId } of otherParticipants) {
		try {
			await sendNotification(
				recipientId,
				NotificationType.NEW_MESSAGE,
				newMessageData,
			);
		} catch (err) {
			console.warn("Failed to create/publish message notification", err);
		}
	}

	try {
		await publishNewMessage(conversationId, {
			id: message.id,
			conversationId: message.conversationId,
			senderId: message.senderId,
			content: message.content,
			createdAt: message.createdAt,
			sender: message.sender ?? undefined,
		});
	} catch (err) {
		console.warn("Failed to publish to conversation channel", err);
	}

	return {
		id: message.id,
		conversationId: message.conversationId,
		senderId: message.senderId,
		content: message.content,
		createdAt: message.createdAt,
		sender: message.sender ?? undefined,
	};
}
