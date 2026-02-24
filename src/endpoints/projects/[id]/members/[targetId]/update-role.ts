import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { updateMemberRole } from "@pointwise/lib/api/members";
import { serializeProject } from "@pointwise/lib/api/projects";
import { sendNotification } from "@pointwise/lib/notifications/service";
import {
	RealtimeChannels,
	RealtimeEvents,
} from "@pointwise/lib/realtime/registry";
import type { UpdateMemberRoleResponse } from "@pointwise/lib/validation/projects-schema";
import { UpdateMemberRoleRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	UpdateMemberRoleResponse,
	{ projectId: string; targetId: string; role: "ADMIN" | "USER" | "VIEWER" }
>({
	name: "updateMemberRole",
	request: UpdateMemberRoleRequestSchema,
	tags: { invalidates: ["Members", "Projects", "Tasks"] },
	protected: true,
	query: ({ projectId, targetId, role }) => ({
		url: `/projects/${projectId}/members/${targetId}/update-role`,
		method: "PATCH",
		body: { role },
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await updateMemberRole(
			params.id,
			user.id,
			params.targetId,
			body.role,
		);
		const project = serializeProject(prismaProject, user.id);

		// Send notification to the affected member
		try {
			await sendNotification(params.targetId, "PROJECT_MEMBER_ROLE_CHANGED", {
				projectId: params.id,
				projectName: prismaProject.name,
				newRole: body.role,
				changedByName: (user.name as string) ?? null,
			});
		} catch {
			// Notification failure should not break the role change action
		}

		// Publish Ably event to all admins so their member lists update
		try {
			await Promise.allSettled(
				prismaProject.adminUserIds.map((adminId) =>
					publishAblyEvent(
						RealtimeChannels.user.projects(adminId),
						RealtimeEvents.MEMBER_ROLE_UPDATED,
						{ projectId: params.id },
					),
				),
			);
		} catch {
			// Ably publish failure should not break the role change action
		}

		return { project };
	},
});
