import { serializeProject, updateProject } from "@pointwise/lib/api/projects";
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
		return { project };
	},
});
