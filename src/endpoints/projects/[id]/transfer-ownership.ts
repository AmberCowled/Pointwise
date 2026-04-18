import {
	serializeProject,
	transferOwnership,
} from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch, emitEvent } from "@pointwise/lib/realtime/publish";
import type { TransferOwnershipResponse } from "@pointwise/lib/validation/projects-schema";
import { TransferOwnershipRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	TransferOwnershipResponse,
	{ projectId: string; newOwnerId: string }
>({
	name: "transferOwnership",
	request: TransferOwnershipRequestSchema,
	tags: { invalidates: ["Projects", "Members"] },
	protected: true,
	query: ({ projectId, newOwnerId }) => ({
		url: `/projects/${projectId}/transfer-ownership`,
		method: "POST",
		body: { newOwnerId },
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await transferOwnership(
			params.id,
			user.id,
			body.newOwnerId,
		);
		const project = serializeProject(prismaProject, user.id);

		try {
			await dispatch(
				"PROJECT_OWNERSHIP_TRANSFERRED",
				user.id,
				{
					projectId: params.id,
					projectName: prismaProject.name,
				},
				[body.newOwnerId],
			);
		} catch (error) {
			logDispatchError("ownership transfer notification", error);
		}

		try {
			const allMembers = [
				...prismaProject.adminUserIds,
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			];
			if (allMembers.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					allMembers,
				);
			}
		} catch (error) {
			logDispatchError("ownership transfer event", error);
		}

		return { project };
	},
});
