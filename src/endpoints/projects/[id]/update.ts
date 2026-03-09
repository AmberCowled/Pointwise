import { serializeProject, updateProject } from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
import type {
	UpdateProjectRequest,
	UpdateProjectResponse,
} from "@pointwise/lib/validation/projects-schema";
import { UpdateProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	UpdateProjectResponse,
	{ projectId: string; data: UpdateProjectRequest }
>({
	name: "updateProject",
	request: UpdateProjectRequestSchema,
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: ({ projectId, data }) => ({
		url: `/projects/${projectId}`,
		method: "PATCH",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await updateProject(params.id, body, user.id);
		const project = serializeProject(prismaProject, user.id);

		try {
			const allMembers = [
				...prismaProject.adminUserIds,
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			];
			const recipients = allMembers.filter((id) => id !== user.id);
			if (recipients.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					recipients,
				);
			}
		} catch (error) {
			logDispatchError("project updated event", error);
		}

		return { project };
	},
});
