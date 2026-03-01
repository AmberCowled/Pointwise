import prisma from "@pointwise/lib/prisma";
import type { GetNotificationSettingsResponse } from "@pointwise/lib/validation/notification-settings-schema";
import { endpoint } from "ertk";

const DEFAULTS = {
	pushEnabled: true,
	pushMessages: true,
	pushFriendRequests: true,
	pushProjectActivity: true,
	pushTaskAssignments: true,
};

export default endpoint.get<GetNotificationSettingsResponse, void>({
	name: "getNotificationSettings",
	tags: { provides: ["NotificationSettings"] },
	protected: true,
	maxRetries: 2,
	query: () => "/user/notification-settings",
	handler: async ({ user }) => {
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { notificationSettings: true },
		});

		return {
			settings: dbUser?.notificationSettings ?? DEFAULTS,
		};
	},
});
