import prisma from "@pointwise/lib/prisma";
import type { NotificationsResponse } from "@pointwise/lib/validation/notification-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const GetNotificationsQuerySchema = z.object({
	cursor: z.string().optional(),
	limit: z.coerce.number().min(1).max(50).default(20).optional(),
});

type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>;

export default endpoint.get<
	NotificationsResponse,
	{ cursor?: string; limit?: number }
>({
	name: "getNotifications",
	request: GetNotificationsQuerySchema,
	tags: { provides: ["Notifications"] },
	protected: true,
	query: ({ cursor, limit } = {}) => {
		const params = new URLSearchParams();
		if (cursor) params.set("cursor", cursor);
		if (limit !== undefined) params.set("limit", String(limit));
		const q = params.toString();
		return `/notifications${q ? `?${q}` : ""}`;
	},
	handler: async ({ user, query }) => {
		const q = query as GetNotificationsQuery | undefined;
		const limit = Math.min(q?.limit ?? 20, 50);
		const cursor = q?.cursor;

		const cursorNotification = cursor
			? await prisma.notification.findFirst({
					where: { id: cursor, userId: user.id },
					select: { createdAt: true },
				})
			: null;

		const notifications = await prisma.notification.findMany({
			where: {
				userId: user.id,
				...(cursorNotification && {
					createdAt: { lt: cursorNotification.createdAt },
				}),
			},
			orderBy: { createdAt: "desc" },
			take: limit + 1,
		});

		const hasMore = notifications.length > limit;
		const list = hasMore ? notifications.slice(0, limit) : notifications;
		const lastItem = list[list.length - 1];
		const nextCursor = hasMore && lastItem ? lastItem.id : null;

		return {
			notifications: list,
			nextCursor,
			hasMore,
		};
	},
});
