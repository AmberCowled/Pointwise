import { publishAblyEvent } from "@pointwise/lib/ably/server";

const MESSAGE_SNIPPET_MAX_LENGTH = 80;

/** Truncate message content for notification snippet (e.g. MessagesMenu preview). */
export function truncateMessageSnippet(content: string): string {
	if (content.length <= MESSAGE_SNIPPET_MAX_LENGTH) return content;
	return `${content.slice(0, MESSAGE_SNIPPET_MAX_LENGTH).trimEnd()}…`;
}

import prisma from "@pointwise/lib/prisma";
import {
	NotificationType,
	type NotificationType as NotificationTypeValue,
} from "@pointwise/lib/validation/notification-schema";
import type { Prisma } from "@prisma/client";
import { type NotificationData, NotificationDataSchemas } from "./types";

/** Ably channel suffix per notification type (channel = user:${recipientId}:${suffix}) */
const CHANNEL_SUFFIX: Record<NotificationTypeValue, string> = {
	[NotificationType.FRIEND_REQUEST_ACCEPTED]: "friend-requests",
	[NotificationType.FRIEND_REQUEST_RECEIVED]: "friend-requests",
	[NotificationType.NEW_MESSAGE]: "messages",
};

export async function sendNotification<T extends NotificationTypeValue>(
	recipientId: string,
	type: T,
	data: NotificationData<T>,
) {
	// 1. Validate data using Zod schema
	const schema = NotificationDataSchemas[type];
	const validatedData = schema.parse(data);

	// 2. Persist to Database
	const notification = await prisma.notification.create({
		data: {
			userId: recipientId,
			type: type,
			data: validatedData as Prisma.InputJsonValue,
		},
	});

	// 3. Publish Realtime Event via Ably
	const channelName = `user:${recipientId}:${CHANNEL_SUFFIX[type]}`;
	try {
		await publishAblyEvent(channelName, "new-notification", {
			...notification,
			data: validatedData,
		});
	} catch (error) {
		console.warn("Realtime notification failed, but DB record saved", error);
	}

	return notification;
}

/**
 * Send a notification to multiple recipients.
 */
export async function sendNotifications<T extends NotificationType>(
	recipientIds: string[],
	type: T,
	data: NotificationData<T>,
) {
	// Filter out duplicate IDs
	const uniqueIds = [...new Set(recipientIds)];

	return Promise.all(
		uniqueIds.map((recipientId) => sendNotification(recipientId, type, data)),
	);
}
