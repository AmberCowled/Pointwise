import prisma from "@pointwise/lib/prisma";
import { endpoint } from "ertk";

export default endpoint.delete<{ success: boolean }, string>({
	name: "deleteNotification",
	tags: { invalidates: ["Notifications"] },
	protected: true,
	query: (notificationId) => ({
		url: `/notifications/${notificationId}`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		await prisma.notification.deleteMany({
			where: { id: params.id, userId: user.id },
		});
		return { success: true };
	},
});
