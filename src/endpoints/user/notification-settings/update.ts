import prisma from "@pointwise/lib/prisma";
import {
	type UpdateNotificationSettings,
	type UpdateNotificationSettingsResponse,
	UpdateNotificationSettingsSchema,
} from "@pointwise/lib/validation/notification-settings-schema";
import { endpoint } from "ertk";

const DEFAULTS = {
	pushEnabled: true,
	pushMessages: true,
	pushFriendRequests: true,
	pushProjectActivity: true,
	pushTaskAssignments: true,
};

export default endpoint.patch<
	UpdateNotificationSettingsResponse,
	UpdateNotificationSettings
>({
	name: "updateNotificationSettings",
	request: UpdateNotificationSettingsSchema,
	tags: { invalidates: ["NotificationSettings"] },
	protected: true,
	query: (data) => ({
		url: "/user/notification-settings",
		method: "PATCH",
		body: data,
	}),
	handler: async ({ user, body }) => {
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { notificationSettings: true },
		});

		const current = dbUser?.notificationSettings ?? DEFAULTS;
		const merged = { ...current, ...body };

		const updated = await prisma.user.update({
			where: { id: user.id },
			data: { notificationSettings: merged },
			select: { notificationSettings: true },
		});

		return {
			settings: updated.notificationSettings ?? merged,
		};
	},
});
