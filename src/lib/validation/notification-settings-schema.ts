import { z } from "zod";

export const NotificationSettingsSchema = z.object({
	pushEnabled: z.boolean(),
	pushMessages: z.boolean(),
	pushFriendRequests: z.boolean(),
	pushProjectActivity: z.boolean(),
	pushTaskAssignments: z.boolean(),
});

export const UpdateNotificationSettingsSchema =
	NotificationSettingsSchema.partial();

export const GetNotificationSettingsResponseSchema = z.object({
	settings: NotificationSettingsSchema,
});

export const UpdateNotificationSettingsResponseSchema = z.object({
	settings: NotificationSettingsSchema,
});

export type NotificationSettingsType = z.infer<
	typeof NotificationSettingsSchema
>;
export type UpdateNotificationSettings = z.infer<
	typeof UpdateNotificationSettingsSchema
>;
export type GetNotificationSettingsResponse = z.infer<
	typeof GetNotificationSettingsResponseSchema
>;
export type UpdateNotificationSettingsResponse = z.infer<
	typeof UpdateNotificationSettingsResponseSchema
>;
