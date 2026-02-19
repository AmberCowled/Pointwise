import { NotificationChannelMap } from "@pointwise/lib/notifications/registry";

/** Channel name builders — single source of truth for all Ably channels. */
export const RealtimeChannels = {
	/** User-scoped channels for notifications. */
	user: {
		friendRequests: (userId: string) => `user:${userId}:friend-requests`,
		messages: (userId: string) => `user:${userId}:messages`,
		projects: (userId: string) => `user:${userId}:projects`,
	},
	/** Entity-scoped channel for live conversation messages. */
	conversation: (conversationId: string) => `conversation:${conversationId}`,
	/** Task-scoped channels. */
	task: {
		comments: (taskId: string) => `task:${taskId}:comments`,
	},
} as const;

/** Event names published on Ably channels. */
export const RealtimeEvents = {
	NEW_NOTIFICATION: "new-notification",
	NEW_MESSAGE: "new-message",
	/** Friend-related events on user:${userId}:friend-requests (not notifications). */
	FRIENDSHIP_REMOVED: "friendship:removed",
	FRIEND_REQUEST_RECEIVED: "friend-request:received",
	FRIEND_REQUEST_DECLINED: "friend-request:declined",
	FRIEND_REQUEST_CANCELLED: "friend-request:cancelled",
	COMMENT_CREATED: "comment:created",
	COMMENT_EDITED: "comment:edited",
	COMMENT_DELETED: "comment:deleted",
	JOIN_REQUEST_REJECTED: "join-request:rejected",
	INVITE_REJECTED: "invite:rejected",
} as const;

/**
 * Get the Ably channel suffix for a notification type.
 * Derived from the notification registry.
 */
export function getChannelForNotificationType(
	type: string,
): string | undefined {
	return (NotificationChannelMap as Record<string, string>)[type];
}
