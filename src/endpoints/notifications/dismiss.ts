import prisma from "@pointwise/lib/prisma";
import { endpoint } from "ertk";
import { z } from "zod";

const DismissBodySchema = z.object({
	type: z.string(),
	dataMatch: z.record(z.string(), z.string()),
});

type DismissBody = z.infer<typeof DismissBodySchema>;

export default endpoint.patch<
	{ success: boolean; count: number },
	{ type: string; dataMatch: Record<string, string> }
>({
	name: "dismissNotifications",
	request: DismissBodySchema,
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (body) => ({
		url: "/notifications/dismiss",
		method: "PATCH",
		body,
	}),
	handler: async ({ user, body }) => {
		const { type, dataMatch } = body as DismissBody;

		// Find notifications matching type and data key-value pairs
		const notifications = await prisma.notification.findMany({
			where: {
				userId: user.id,
				type,
				read: false,
			},
			select: { id: true, data: true },
		});

		const matchingIds = notifications
			.filter((n) => {
				const data = n.data as Record<string, unknown> | null;
				if (!data) return false;
				return Object.entries(dataMatch).every(
					([key, value]) => String(data[key]) === value,
				);
			})
			.map((n) => n.id);

		if (matchingIds.length > 0) {
			await prisma.notification.updateMany({
				where: { id: { in: matchingIds } },
				data: { read: true },
			});
		}

		return { success: true, count: matchingIds.length };
	},
});
