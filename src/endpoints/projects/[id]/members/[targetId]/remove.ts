import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { removeMember } from "@pointwise/lib/api/members";
import { serializeProject } from "@pointwise/lib/api/projects";
import { sendNotification } from "@pointwise/lib/notifications/service";
import {
	RealtimeChannels,
	RealtimeEvents,
} from "@pointwise/lib/realtime/registry";
import type { RemoveMemberResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	RemoveMemberResponse,
	{ projectId: string; targetId: string }
>({
	name: "removeProjectMember",
	tags: { invalidates: ["Members", "Projects"] },
	protected: true,
	query: ({ projectId, targetId }) => ({
		url: `/projects/${projectId}/members/${targetId}/remove`,
		method: "DELETE",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await removeMember(
			params.id,
			user.id,
			params.targetId,
		);
		const project = serializeProject(prismaProject, user.id);

		// Send notification to the removed member
		try {
			await sendNotification(params.targetId, "PROJECT_MEMBER_REMOVED", {
				projectId: params.id,
				projectName: prismaProject.name,
				removedByName: (user.name as string) ?? null,
			});
		} catch {
			// Notification failure should not break the remove action
		}

		// Publish Ably event to all admins so their member lists update
		try {
			await Promise.allSettled(
				prismaProject.adminUserIds.map((adminId) =>
					publishAblyEvent(
						RealtimeChannels.user.projects(adminId),
						RealtimeEvents.MEMBER_REMOVED,
						{ projectId: params.id },
					),
				),
			);
		} catch {
			// Ably publish failure should not break the remove action
		}

		return { project };
	},
});
