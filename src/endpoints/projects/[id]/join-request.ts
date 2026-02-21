import { publishAblyEvent } from "@pointwise/lib/ably/server";
import { requestToJoin, serializeProject } from "@pointwise/lib/api/projects";
import { sendNotifications } from "@pointwise/lib/notifications/service";
import {
	RealtimeChannels,
	RealtimeEvents,
} from "@pointwise/lib/realtime/registry";
import type { RequestToJoinProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	RequestToJoinProjectResponse,
	{ projectId: string }
>({
	name: "requestToJoinProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: ({ projectId }) => ({
		url: `/projects/${projectId}/join-request`,
		method: "POST",
	}),
	handler: async ({ user, params }) => {
		const prismaProject = await requestToJoin(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);

		// Send PROJECT_JOIN_REQUEST_RECEIVED notification to all admins
		try {
			await sendNotifications(
				prismaProject.adminUserIds,
				"PROJECT_JOIN_REQUEST_RECEIVED",
				{
					projectId: params.id,
					projectName: prismaProject.name,
					requesterId: user.id,
					requesterName: (user.name as string) ?? null,
					requesterImage: (user.image as string) ?? null,
				},
			);
		} catch {
			// Notification failure should not break the join request action
		}

		// Publish lightweight Ably event to admins so pending requests count updates
		try {
			await Promise.allSettled(
				prismaProject.adminUserIds.map((adminId) =>
					publishAblyEvent(
						RealtimeChannels.user.projects(adminId),
						RealtimeEvents.JOIN_REQUEST_RECEIVED,
						{ projectId: params.id },
					),
				),
			);
		} catch {
			// Ably publish failure should not break the join request action
		}

		return { project };
	},
});
