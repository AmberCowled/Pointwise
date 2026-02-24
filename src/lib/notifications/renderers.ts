import type {
	FriendRequestAcceptedData,
	FriendRequestReceivedData,
	NotificationData,
} from "@pointwise/lib/validation/notification-schema";

type ProjectMemberRoleChangedData =
	NotificationData<"PROJECT_MEMBER_ROLE_CHANGED">;
type ProjectMemberRemovedData = NotificationData<"PROJECT_MEMBER_REMOVED">;

export interface NotificationAction {
	label: string;
	variant: "accept" | "reject";
	/** Returns the arguments to pass to the mutation. */
	getPayload: (data: Record<string, unknown>) => Record<string, unknown>;
}

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
	/** If present, render action buttons instead of a link. */
	getActions?(data: Record<string, unknown>): NotificationAction[];
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
		getActions(data) {
			const d = data as NotificationData<"PROJECT_INVITE_RECEIVED">;
			return [
				{
					label: "Accept",
					variant: "accept",
					getPayload: () => ({ inviteId: d.inviteId }),
				},
				{
					label: "Reject",
					variant: "reject",
					getPayload: () => ({ inviteId: d.inviteId }),
				},
			];
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
		getActions(data) {
			const d = data as NotificationData<"PROJECT_JOIN_REQUEST_RECEIVED">;
			return [
				{
					label: "Approve",
					variant: "accept",
					getPayload: () => ({
						projectId: d.projectId,
						userId: d.requesterId,
					}),
				},
				{
					label: "Reject",
					variant: "reject",
					getPayload: () => ({
						projectId: d.projectId,
						userId: d.requesterId,
					}),
				},
			];
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
	PROJECT_MEMBER_ROLE_CHANGED: {
		getMessage(data) {
			const d = data as ProjectMemberRoleChangedData;
			return `Your role in ${d.projectName} was changed to ${d.newRole}.`;
		},
		getUser() {
			return { name: "System", image: null };
		},
		getHref(data) {
			const d = data as ProjectMemberRoleChangedData;
			return `/dashboard/${d.projectId}`;
		},
	},
	PROJECT_MEMBER_REMOVED: {
		getMessage(data) {
			const d = data as ProjectMemberRemovedData;
			return `You were removed from ${d.projectName}.`;
		},
		getUser() {
			return { name: "System", image: null };
		},
	},
	TASK_ASSIGNED: {
		getMessage(data) {
			const d = data as NotificationData<"TASK_ASSIGNED">;
			return `${d.assignedByName ?? "Someone"} assigned you to "${d.taskName}" in ${d.projectName}.`;
		},
		getUser(data) {
			const d = data as NotificationData<"TASK_ASSIGNED">;
			return { name: d.assignedByName ?? "User", image: d.assignedByImage };
		},
		getHref(data) {
			const d = data as NotificationData<"TASK_ASSIGNED">;
			return `/dashboard/${d.projectId}`;
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
