/** Payload for new-notification event on user channels. */
export interface NewNotificationPayload {
	id: string;
	userId: string;
	type: string;
	data: unknown;
	read: boolean;
	createdAt: string;
}

/** Payload for new-message event on conversation channel. */
export interface NewMessagePayload {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	createdAt: string;
	sender?: {
		id: string;
		displayName: string | null;
		image: string | null;
	};
}

/** Payload for comment events on task channels. */
export interface CommentEventPayload {
	commentId: string;
	threadId: string;
	taskId: string;
	parentCommentId: string | null;
	comment: Record<string, unknown> | null;
}

/** Union of all known event payloads (for handlers). */
export type RealtimeEventPayload =
	| NewNotificationPayload
	| NewMessagePayload
	| CommentEventPayload;
