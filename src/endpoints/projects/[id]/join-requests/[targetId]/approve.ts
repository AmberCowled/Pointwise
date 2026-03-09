import { approveJoinRequest } from "@pointwise/lib/api/joinRequests";
import { serializeProject } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
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
			await dispatch(
				"PROJECT_JOIN_REQUEST_APPROVED",
				user.id,
				{
					projectId: params.id,
					projectName: prismaProject.name,
					role: body.role,
				},
				[params.targetId],
			);
		} catch (error) {
			logDispatchError("join request approve notification", error);
		}

		// Dismiss stale PROJECT_JOIN_REQUEST_RECEIVED notifications for all admins
		try {
			const staleNotifications = await prisma.notification.findMany({
				where: {
					type: "PROJECT_JOIN_REQUEST_RECEIVED",
					read: false,
				},
				select: { id: true, data: true, userId: true },
			});
			const matchingNotifs = staleNotifications.filter((n) => {
				const d = n.data as Record<string, unknown> | null;
				return d?.projectId === params.id && d?.actorId === params.targetId;
			});
			const idsToMark = matchingNotifs.map((n) => n.id);
			if (idsToMark.length > 0) {
				await prisma.notification.updateMany({
					where: { id: { in: idsToMark } },
					data: { read: true },
				});
				const affectedUserIds = [
					...new Set(matchingNotifs.map((n) => n.userId)),
				];
				await Promise.all(
					affectedUserIds.map((uid) =>
						emitEvent("NOTIFICATIONS_READ", { userId: uid }, [uid]),
					),
				);
			}
		} catch (error) {
			logDispatchError("join request staleness cleanup", error);
		}

		// Publish lightweight Ably event to admins so their menu count updates
		try {
			const filteredAdminIds = prismaProject.adminUserIds.filter(
				(adminId) => adminId !== user.id,
			);
			await dispatch(
				"JOIN_REQUEST_APPROVED",
				{ projectId: params.id },
				filteredAdminIds,
			);

			// Realtime cache invalidation for non-admin members
			const nonAdminMembers = [
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			].filter((id) => id !== params.targetId);
			if (nonAdminMembers.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					nonAdminMembers,
				);
			}
		} catch (error) {
			logDispatchError("join request approve event", error);
		}

		return { success: true, project };
	},
});
