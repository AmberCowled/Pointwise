import { z } from "zod";

const notificationTypeValues = [
	"FRIEND_REQUEST_ACCEPTED",
	"FRIEND_REQUEST_RECEIVED",
	"NEW_MESSAGE",
] as const;

export const NotificationTypeSchema = z.enum(notificationTypeValues);

/** Enum-like object for NotificationType (e.g. NotificationType.FRIEND_REQUEST_ACCEPTED). */
export const NotificationType = {
	FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
	FRIEND_REQUEST_RECEIVED: "FRIEND_REQUEST_RECEIVED",
	NEW_MESSAGE: "NEW_MESSAGE",
} as const satisfies Record<string, NotificationType>;

export const FriendRequestAcceptedDataSchema = z.object({
	accepterId: z.string(),
	accepterName: z.string().nullable(),
	accepterImage: z.string().nullable(),
});

export const FriendRequestReceivedDataSchema = z.object({
	senderId: z.string(),
	senderName: z.string().nullable(),
	senderImage: z.string().nullable(),
});

export const NewMessageDataSchema = z.object({
	conversationId: z.string(),
	senderId: z.string(),
	senderName: z.string().nullable(),
	senderImage: z.string().nullable(),
	messageSnippet: z.string(),
	messageId: z.string(),
});

export const NotificationDataSchema = z.union([
	FriendRequestAcceptedDataSchema,
	FriendRequestReceivedDataSchema,
	NewMessageDataSchema,
]);

export const NotificationSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: NotificationTypeSchema,
	data: z.any(), // We use any here because it's a JSON field, but we validate it with specific schemas when sending
	read: z.boolean(),
	createdAt: z.string().or(z.date()),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type FriendRequestAcceptedData = z.infer<
	typeof FriendRequestAcceptedDataSchema
>;
export type FriendRequestReceivedData = z.infer<
	typeof FriendRequestReceivedDataSchema
>;
export type NewMessageData = z.infer<typeof NewMessageDataSchema>;
