import prisma from "@pointwise/lib/prisma";
import type { DeletePreviewResponse } from "@pointwise/lib/validation/account-schema";
import { endpoint } from "ertk";

export default endpoint.get<DeletePreviewResponse, void>({
	name: "getDeletePreview",
	tags: { provides: ["DeletePreview"] },
	protected: true,
	maxRetries: 2,
	query: () => "/user/delete-preview",
	handler: async ({ user }) => {
		// Find all projects where this user is an admin
		const adminProjects = await prisma.project.findMany({
			where: {
				adminUserIds: { has: user.id },
			},
			select: {
				id: true,
				name: true,
				adminUserIds: true,
				projectUserIds: true,
				viewerUserIds: true,
				_count: { select: { tasks: true } },
			},
		});

		// Filter to projects where user is the sole admin
		const soleAdminProjects = adminProjects
			.filter((p) => p.adminUserIds.length === 1)
			.map((p) => ({
				id: p.id,
				name: p.name,
				memberCount:
					p.adminUserIds.length +
					p.projectUserIds.length +
					p.viewerUserIds.length,
				taskCount: p._count.tasks,
			}));

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { email: true },
		});

		return {
			preview: {
				soleAdminProjects,
				email: dbUser?.email ?? "",
			},
		};
	},
});
