/**
 * Server-only publish functions for the realtime layer.
 * Import only from API routes, lib/api, or lib/notifications.
 */
import { publishAblyEvent } from "@pointwise/lib/ably/server";
import type { Notification } from "@pointwise/lib/validation/notification-schema";
import {
	NOTIFICATION_TYPE_TO_CHANNEL,
	RealtimeChannels,
	RealtimeEvents,
} from "./registry";
import type { NewMessagePayload } from "./types";

/**
 * Publish a notification to the recipient's Ably channel.
 * Channel is chosen by notification type (friend-requests vs messages).
 */
export async function publishNotification(
	notification: Notification,
): Promise<void> {
	const suffix = NOTIFICATION_TYPE_TO_CHANNEL[notification.type];
	if (!suffix) return;

	const channelName =
		suffix === "friend-requests"
			? RealtimeChannels.user.friendRequests(notification.userId)
			: RealtimeChannels.user.messages(notification.userId);

	await publishAblyEvent(channelName, RealtimeEvents.NEW_NOTIFICATION, {
		...notification,
		createdAt:
			typeof notification.createdAt === "string"
				? notification.createdAt
				: notification.createdAt.toISOString(),
		data: notification.data,
	});
}

/**
 * Publish a new message to the conversation's Ably channel.
 */
export async function publishNewMessage(
	conversationId: string,
	message: Omit<NewMessagePayload, "createdAt"> & {
		createdAt: string | Date;
	},
): Promise<void> {
	const channelName = RealtimeChannels.conversation(conversationId);
	const payload: Record<string, unknown> = {
		...message,
		createdAt:
			typeof message.createdAt === "string"
				? message.createdAt
				: message.createdAt instanceof Date
					? message.createdAt.toISOString()
					: String(message.createdAt),
	};
	await publishAblyEvent(channelName, RealtimeEvents.NEW_MESSAGE, payload);
}
