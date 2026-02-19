import { z } from "zod";
import {
	NotificationRegistry,
	notificationTypeValues,
} from "../notifications/registry";

// Re-export everything consumers need from the registry
export {
	type NotificationData,
	NotificationType,
	notificationTypeValues,
} from "../notifications/registry";

/** Individual data type exports (derived from registry). */
export type FriendRequestAcceptedData =
	NotificationData<"FRIEND_REQUEST_ACCEPTED">;
export type FriendRequestReceivedData =
	NotificationData<"FRIEND_REQUEST_RECEIVED">;
export type NewMessageData = NotificationData<"NEW_MESSAGE">;

/** Individual data schema exports (derived from registry). */
export const FriendRequestAcceptedDataSchema =
	NotificationRegistry.FRIEND_REQUEST_ACCEPTED.schema;
export const FriendRequestReceivedDataSchema =
	NotificationRegistry.FRIEND_REQUEST_RECEIVED.schema;
export const NewMessageDataSchema = NotificationRegistry.NEW_MESSAGE.schema;

/** Union of all data schemas. */
export const NotificationDataSchema = z.union([
	FriendRequestAcceptedDataSchema,
	FriendRequestReceivedDataSchema,
	NewMessageDataSchema,
]);

/** Zod schema for the notification type field (validated at app level, stored as String in DB). */
export const NotificationTypeSchema = z
	.string()
	.refine(
		(val): val is (typeof notificationTypeValues)[number] =>
			notificationTypeValues.includes(val as never),
		{ message: "Invalid notification type" },
	);

/** Full notification record shape. */
export const NotificationSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.string(),
	data: z.any(),
	read: z.boolean(),
	createdAt: z.string().or(z.date()),
});

export type Notification = z.infer<typeof NotificationSchema>;

/** Paginated response shape for the notifications list endpoint. */
export interface NotificationsResponse {
	notifications: Notification[];
	nextCursor: string | null;
	hasMore: boolean;
}
