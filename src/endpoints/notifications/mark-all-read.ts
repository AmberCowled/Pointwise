import { endpoint } from "@pointwise/lib/ertk";
import prisma from "@pointwise/lib/prisma";

export default endpoint.patch<{ success: boolean }, void>({
	name: "markAllRead",
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: () => ({ url: "/notifications/mark-all-read", method: "PATCH" }),
	handler: async ({ user }) => {
		await prisma.notification.updateMany({
			where: { userId: user.id, read: false },
			data: { read: true },
		});
		return { success: true };
	},
});
