import prisma from "@pointwise/lib/prisma";
import type { Notification } from "@pointwise/lib/validation/notification-schema";
import { endpoint } from "ertk";

export default endpoint.get<Notification[], void>({
	name: "getNotifications",
	tags: { provides: ["Notifications"] },
	protected: true,
	query: () => "/notifications",
	handler: async ({ user }) => {
		const notifications = await prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			take: 20,
		});
		return notifications;
	},
});
