import type {
	FriendRequestAcceptedData,
	FriendRequestReceivedData,
	NotificationData,
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
	PROJECT_INVITE_RECEIVED: {
		getMessage(data) {
			const d = data as NotificationData<"PROJECT_INVITE_RECEIVED">;
			return `${d.inviterName ?? "Someone"} invited you to join ${d.projectName}.`;
		},
		getUser(data) {
			const d = data as NotificationData<"PROJECT_INVITE_RECEIVED">;
			return { name: d.inviterName ?? "User", image: d.inviterImage };
		},
	},
	PROJECT_INVITE_ACCEPTED: {
		getMessage(data) {
			const d = data as NotificationData<"PROJECT_INVITE_ACCEPTED">;
			return `${d.accepterName ?? "Someone"} accepted your invite to ${d.projectName}.`;
		},
		getUser(data) {
			const d = data as NotificationData<"PROJECT_INVITE_ACCEPTED">;
			return { name: d.accepterName ?? "User", image: d.accepterImage };
		},
		getHref(data) {
			const d = data as NotificationData<"PROJECT_INVITE_ACCEPTED">;
			return `/projects/${d.projectId}`;
		},
	},
	PROJECT_JOIN_REQUEST_RECEIVED: {
		getMessage(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_RECEIVED">;
			return `${d.requesterName ?? "Someone"} requested to join ${d.projectName}.`;
		},
		getUser(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_RECEIVED">;
			return { name: d.requesterName ?? "User", image: d.requesterImage };
		},
		getHref(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_RECEIVED">;
			return `/projects/${d.projectId}`;
		},
	},
	PROJECT_JOIN_REQUEST_APPROVED: {
		getMessage(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_APPROVED">;
			return `Your request to join ${d.projectName} was approved!`;
		},
		getUser() {
			return { name: "System", image: null };
		},
		getHref(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_APPROVED">;
			return `/projects/${d.projectId}`;
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
