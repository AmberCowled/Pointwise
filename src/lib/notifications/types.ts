import { z } from "zod";
import {
	FriendRequestAcceptedDataSchema,
	FriendRequestReceivedDataSchema,
	NotificationType,
} from "../validation/notification-schema";

export { NotificationType };

export const NotificationDataSchemas = {
	[NotificationType.FRIEND_REQUEST_ACCEPTED]: FriendRequestAcceptedDataSchema,
	[NotificationType.FRIEND_REQUEST_RECEIVED]: FriendRequestReceivedDataSchema,
} as const;

export type NotificationData<T extends NotificationType> = z.infer<
	(typeof NotificationDataSchemas)[T]
>;
