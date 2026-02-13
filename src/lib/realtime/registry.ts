/** Channel name builders — single source of truth for all Ably channels. */
export const RealtimeChannels = {
	/** User-scoped channels for notifications. */
	user: {
		friendRequests: (userId: string) => `user:${userId}:friend-requests`,
		messages: (userId: string) => `user:${userId}:messages`,
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
} as const;

/** Maps NotificationType to user channel suffix (for publish logic). */
export const NOTIFICATION_TYPE_TO_CHANNEL: Record<string, string> = {
	FRIEND_REQUEST_ACCEPTED: "friend-requests",
	FRIEND_REQUEST_RECEIVED: "friend-requests",
	NEW_MESSAGE: "messages",
};
