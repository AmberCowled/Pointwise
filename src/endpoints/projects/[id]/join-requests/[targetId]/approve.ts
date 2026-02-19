import { approveJoinRequest } from "@pointwise/lib/api/joinRequests";
import { serializeProject } from "@pointwise/lib/api/projects";
import { sendNotification } from "@pointwise/lib/notifications/service";
import prisma from "@pointwise/lib/prisma";
import type { GetProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const ApproveJoinRequestSchema = z.object({
	role: z.enum(["ADMIN", "USER", "VIEWER"]),
});

export default endpoint.patch<
	{ success: boolean; project: GetProjectResponse["project"] },
	{ projectId: string; userId: string; role: "ADMIN" | "USER" | "VIEWER" }
>({
	name: "approveJoinRequest",
	request: ApproveJoinRequestSchema,
	tags: { invalidates: ["JoinRequests", "Projects"] },
	protected: true,
	query: ({ projectId, userId, role }) => ({
		url: `/projects/${projectId}/join-requests/${userId}/approve`,
		method: "PATCH",
		body: { role },
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await approveJoinRequest(
			params.id,
			user.id,
			params.targetId,
			body.role,
		);
		const project = serializeProject(prismaProject, user.id);

		// Send PROJECT_JOIN_REQUEST_APPROVED notification to the requesting user
		try {
			await sendNotification(params.targetId, "PROJECT_JOIN_REQUEST_APPROVED", {
				projectId: params.id,
				projectName: prismaProject.name,
				role: body.role,
			});
		} catch {
			// Notification failure should not break the approve action
		}

		// Dismiss stale PROJECT_JOIN_REQUEST_RECEIVED notifications for all admins
		try {
			const staleNotifications = await prisma.notification.findMany({
				where: {
					type: "PROJECT_JOIN_REQUEST_RECEIVED",
					read: false,
				},
				select: { id: true, data: true },
			});
			const idsToMark = staleNotifications
				.filter((n) => {
					const d = n.data as Record<string, unknown> | null;
					return (
						d?.projectId === params.id && d?.requesterId === params.targetId
					);
				})
				.map((n) => n.id);
			if (idsToMark.length > 0) {
				await prisma.notification.updateMany({
					where: { id: { in: idsToMark } },
					data: { read: true },
				});
			}
		} catch {
			// Staleness cleanup failure should not break the approve action
		}

		return { success: true, project };
	},
});
