import { inviteUsersToProject } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import type {
	InviteProjectRequest,
	InviteProjectResponse,
} from "@pointwise/lib/validation/projects-schema";
import { InviteProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<
	InviteProjectResponse,
	{ projectId: string; data: InviteProjectRequest }
>({
	name: "inviteUsersToProject",
	request: InviteProjectRequestSchema,
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: ({ projectId, data }) => ({
		url: `/projects/${projectId}/invite`,
		method: "POST",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await inviteUsersToProject(
			params.id,
			user.id,
			body.invites,
		);
		const project = serializeProject(prismaProject, user.id);
		return { project };
	},
});
