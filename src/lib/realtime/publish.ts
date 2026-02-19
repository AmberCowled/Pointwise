/**
 * Server-only publish functions for the realtime layer.
 * Import only from API routes, lib/api, or lib/notifications.
 */
import { publishAblyEvent } from "@pointwise/lib/ably/server";
import type { Notification } from "@pointwise/lib/validation/notification-schema";
import {
	getChannelForNotificationType,
	RealtimeChannels,
	RealtimeEvents,
} from "./registry";
import type { CommentEventPayload, NewMessagePayload } from "./types";

/** Map channel suffix → channel name builder. */
const CHANNEL_BUILDERS: Record<string, (userId: string) => string> = {
	"friend-requests": RealtimeChannels.user.friendRequests,
	messages: RealtimeChannels.user.messages,
	projects: RealtimeChannels.user.projects,
};

/**
 * Publish a notification to the recipient's Ably channel.
 * Channel is derived from the notification registry.
 */
export async function publishNotification(
	notification: Notification,
): Promise<void> {
	const suffix = getChannelForNotificationType(notification.type);
	if (!suffix) {
		console.warn(
			`[realtime] No channel mapping for notification type "${notification.type}"`,
		);
		return;
	}

	const buildChannel = CHANNEL_BUILDERS[suffix];
	if (!buildChannel) {
		console.warn(
			`[realtime] Unknown channel suffix "${suffix}" for type "${notification.type}"`,
		);
		return;
	}

	const channelName = buildChannel(notification.userId);
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

/**
 * Publish a comment event to the task's comment channel.
 */
export async function publishCommentEvent(
	taskId: string,
	eventName: string,
	payload: CommentEventPayload,
): Promise<void> {
	const channelName = RealtimeChannels.task.comments(taskId);
	await publishAblyEvent(
		channelName,
		eventName,
		payload as unknown as Record<string, unknown>,
	);
}
