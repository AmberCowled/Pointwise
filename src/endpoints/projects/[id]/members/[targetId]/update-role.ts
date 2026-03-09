import { updateMemberRole } from "@pointwise/lib/api/members";
import { serializeProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
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
			await dispatch(
				"PROJECT_MEMBER_ROLE_CHANGED",
				user.id,
				{
					projectId: params.id,
					projectName: prismaProject.name,
					newRole: body.role,
				},
				[params.targetId],
			);
		} catch (error) {
			logDispatchError("role change notification", error);
		}

		// Publish Ably event to all admins so their member lists update
		try {
			await dispatch(
				"MEMBER_ROLE_UPDATED",
				{ projectId: params.id },
				prismaProject.adminUserIds,
			);

			// Realtime cache invalidation for non-admin members
			const nonAdminMembers = [
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			].filter((id) => id !== user.id && id !== params.targetId);
			if (nonAdminMembers.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					nonAdminMembers,
				);
			}
		} catch (error) {
			logDispatchError("role update event", error);
		}

		return { project };
	},
});
