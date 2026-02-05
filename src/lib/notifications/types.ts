import type { z } from "zod";
import {
	FriendRequestAcceptedDataSchema,
	FriendRequestReceivedDataSchema,
	NewMessageDataSchema,
	NotificationType,
} from "../validation/notification-schema";

export { NotificationType };

export const NotificationDataSchemas = {
	[NotificationType.FRIEND_REQUEST_ACCEPTED]: FriendRequestAcceptedDataSchema,
	[NotificationType.FRIEND_REQUEST_RECEIVED]: FriendRequestReceivedDataSchema,
	[NotificationType.NEW_MESSAGE]: NewMessageDataSchema,
} as const;

export type NotificationData<T extends NotificationType> = z.infer<
	(typeof NotificationDataSchemas)[T]
>;
