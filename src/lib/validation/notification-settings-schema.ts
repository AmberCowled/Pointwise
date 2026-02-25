import { z } from "zod";

export const NotificationSettingsSchema = z.object({
	pushEnabled: z.boolean(),
	pushMessages: z.boolean(),
	pushFriendRequests: z.boolean(),
	pushProjectActivity: z.boolean(),
	pushTaskAssignments: z.boolean(),
});

export type NotificationSettingsType = z.infer<
	typeof NotificationSettingsSchema
>;

export const UpdateNotificationSettingsSchema =
	NotificationSettingsSchema.partial();

export type UpdateNotificationSettings = z.infer<
	typeof UpdateNotificationSettingsSchema
>;

export type GetNotificationSettingsResponse = {
	settings: NotificationSettingsType;
};

export type UpdateNotificationSettingsResponse = {
	settings: NotificationSettingsType;
};
