import prisma from "@pointwise/lib/prisma";
import { endpoint } from "ertk";
import { z } from "zod";

const MarkAllReadBodySchema = z
	.object({
		excludeTypes: z.array(z.string()).optional(),
	})
	.optional();

type MarkAllReadBody = z.infer<typeof MarkAllReadBodySchema>;

export default endpoint.patch<
	{ success: boolean },
	{ excludeTypes?: string[] } | undefined
>({
	name: "markAllRead",
	request: MarkAllReadBodySchema,
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (body) => ({
		url: "/notifications/mark-all-read",
		method: "PATCH",
		body: body ?? undefined,
	}),
	handler: async ({ user, body }) => {
		const parsed = body as MarkAllReadBody | undefined;
		const excludeTypes = parsed?.excludeTypes;

		await prisma.notification.updateMany({
			where: {
				userId: user.id,
				read: false,
				...(excludeTypes &&
					excludeTypes.length > 0 && {
						type: { notIn: excludeTypes },
					}),
			},
			data: { read: true },
		});
		return { success: true };
	},
});
