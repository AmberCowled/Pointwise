import type {
	FriendRequestAcceptedData,
	FriendRequestReceivedData,
} from "@pointwise/lib/validation/notification-schema";

export interface NotificationRenderer {
	/** Human-readable message for the notification. */
	getMessage(data: Record<string, unknown>): string;
	/** User info for avatar/name display. Returns { name, image }. */
	getUser(data: Record<string, unknown>): {
		name: string;
		image: string | null;
	};
	/** Optional link to navigate to when clicking the notification. */
	getHref?(data: Record<string, unknown>): string;
}

export const NOTIFICATION_RENDERERS: Record<string, NotificationRenderer> = {
	FRIEND_REQUEST_ACCEPTED: {
		getMessage(data) {
			const d = data as FriendRequestAcceptedData;
			return `${d.accepterName ?? "Someone"} accepted your friend request.`;
		},
		getUser(data) {
			const d = data as FriendRequestAcceptedData;
			return { name: d.accepterName ?? "User", image: d.accepterImage };
		},
	},
	FRIEND_REQUEST_RECEIVED: {
		getMessage(data) {
			const d = data as FriendRequestReceivedData;
			return `${d.senderName ?? "Someone"} sent you a friend request.`;
		},
		getUser(data) {
			const d = data as FriendRequestReceivedData;
			return { name: d.senderName ?? "User", image: d.senderImage };
		},
	},
};

/** Fallback renderer for unknown notification types. */
export const FALLBACK_RENDERER: NotificationRenderer = {
	getMessage() {
		return "You have a new notification.";
	},
	getUser() {
		return { name: "User", image: null };
	},
};
