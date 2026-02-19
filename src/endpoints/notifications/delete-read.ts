import prisma from "@pointwise/lib/prisma";
import { endpoint } from "ertk";
import { z } from "zod";

const DeleteReadBodySchema = z
	.object({
		olderThanDays: z.coerce.number().min(1).max(365).default(30).optional(),
	})
	.optional();

type DeleteReadBody = z.infer<typeof DeleteReadBodySchema>;

export default endpoint.delete<
	{ success: boolean; deletedCount: number },
	{ olderThanDays?: number } | undefined
>({
	name: "deleteReadNotifications",
	request: DeleteReadBodySchema,
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (body) => ({
		url: "/notifications/delete-read",
		method: "DELETE",
		body: body ?? undefined,
	}),
	handler: async ({ user, body }) => {
		const parsed = body as DeleteReadBody | undefined;
		const days = parsed?.olderThanDays ?? 30;
		const threshold = new Date();
		threshold.setDate(threshold.getDate() - days);

		const result = await prisma.notification.deleteMany({
			where: {
				userId: user.id,
				read: true,
				createdAt: { lt: threshold },
			},
		});

		return { success: true, deletedCount: result.count };
	},
});
