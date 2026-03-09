import { removeMember } from "@pointwise/lib/api/members";
import { serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { RemoveMemberResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<
	RemoveMemberResponse,
	{ projectId: string; targetId: string }
>({
	name: "removeProjectMember",
	tags: { invalidates: ["Members", "Projects", "Tasks"] },
	protected: true,
	query: ({ projectId, targetId }) => ({
		url: `/projects/${projectId}/members/${targetId}`,
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
			await dispatch(
				"PROJECT_MEMBER_REMOVED",
				user.id,
				{
					projectId: params.id,
					projectName: prismaProject.name,
				},
				[params.targetId],
			);
		} catch (error) {
			logDispatchError("member removed notification", error);
		}

		// Publish Ably event to all admins so their member lists update
		try {
			await dispatch(
				"MEMBER_REMOVED",
				{ projectId: params.id },
				prismaProject.adminUserIds,
			);

			// Realtime cache invalidation for non-admin members
			const nonAdminMembers = [
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			].filter((id) => id !== user.id);
			if (nonAdminMembers.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					nonAdminMembers,
				);
			}
		} catch (error) {
			logDispatchError("member removed event", error);
		}

		return { project };
	},
});
