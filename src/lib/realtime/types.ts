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

/** Union of all known event payloads (for handlers). */
export type RealtimeEventPayload = NewNotificationPayload | NewMessagePayload;
