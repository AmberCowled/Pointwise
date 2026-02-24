import { z } from "zod";

/**
 * Notification Registry — single source of truth for all notification types.
 *
 * To add a new notification type:
 * 1. Add an entry here with `channel` and `schema`
 * 2. Call `sendNotification(recipientId, "YOUR_TYPE", data)` from your endpoint/service
 * 3. Add a renderer in `src/lib/notifications/renderers.ts` for frontend display
 */
export const NotificationRegistry = {
	FRIEND_REQUEST_ACCEPTED: {
		channel: "friend-requests",
		schema: z.object({
			accepterId: z.string(),
			accepterName: z.string().nullable(),
			accepterImage: z.string().nullable(),
		}),
	},
	FRIEND_REQUEST_RECEIVED: {
		channel: "friend-requests",
		schema: z.object({
			senderId: z.string(),
			senderName: z.string().nullable(),
			senderImage: z.string().nullable(),
		}),
	},
	NEW_MESSAGE: {
		channel: "messages",
		schema: z.object({
			conversationId: z.string(),
			senderId: z.string(),
			senderName: z.string().nullable(),
			senderImage: z.string().nullable(),
			messageSnippet: z.string(),
			messageId: z.string(),
		}),
	},
	PROJECT_INVITE_RECEIVED: {
		channel: "projects",
		schema: z.object({
			inviteId: z.string(),
			projectId: z.string(),
			projectName: z.string(),
			inviterName: z.string().nullable(),
			inviterImage: z.string().nullable(),
			role: z.string(),
		}),
	},
	PROJECT_INVITE_ACCEPTED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			accepterName: z.string().nullable(),
			accepterImage: z.string().nullable(),
			role: z.string(),
		}),
	},
	PROJECT_JOIN_REQUEST_RECEIVED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			requesterId: z.string(),
			requesterName: z.string().nullable(),
			requesterImage: z.string().nullable(),
		}),
	},
	PROJECT_JOIN_REQUEST_APPROVED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			role: z.string(),
		}),
	},
	PROJECT_MEMBER_ROLE_CHANGED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			newRole: z.string(),
			changedByName: z.string().nullable(),
		}),
	},
	PROJECT_MEMBER_REMOVED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			removedByName: z.string().nullable(),
		}),
	},
	TASK_ASSIGNED: {
		channel: "projects",
		schema: z.object({
			projectId: z.string(),
			projectName: z.string(),
			taskId: z.string(),
			taskName: z.string(),
			assignedByName: z.string().nullable(),
			assignedByImage: z.string().nullable(),
		}),
	},
} as const;

/** All valid notification type strings, derived from the registry. */
export type NotificationType = keyof typeof NotificationRegistry;

/** Array of all notification type values (for validation). */
export const notificationTypeValues = Object.keys(
	NotificationRegistry,
) as NotificationType[];

/** Enum-like object for NotificationType (e.g. NotificationType.FRIEND_REQUEST_ACCEPTED). */
export const NotificationType = Object.fromEntries(
	notificationTypeValues.map((k) => [k, k]),
) as { [K in NotificationType]: K };

/** Map of notification type → Zod data schema. */
export const NotificationDataSchemas = Object.fromEntries(
	Object.entries(NotificationRegistry).map(([key, entry]) => [
		key,
		entry.schema,
	]),
) as { [K in NotificationType]: (typeof NotificationRegistry)[K]["schema"] };

/** Inferred data type for a given notification type. */
export type NotificationData<T extends NotificationType> = z.infer<
	(typeof NotificationRegistry)[T]["schema"]
>;

/** Map of notification type → Ably channel suffix. */
export const NotificationChannelMap = Object.fromEntries(
	Object.entries(NotificationRegistry).map(([key, entry]) => [
		key,
		entry.channel,
	]),
) as { [K in NotificationType]: (typeof NotificationRegistry)[K]["channel"] };

/** All unique channel suffixes used by notifications. */
export type NotificationChannelSuffix =
	(typeof NotificationRegistry)[NotificationType]["channel"];
