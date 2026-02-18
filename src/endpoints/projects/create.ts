import { createProject, serializeProject } from "@pointwise/lib/api/projects";
import type {
	CreateProjectRequest,
	CreateProjectResponse,
} from "@pointwise/lib/validation/projects-schema";
import { CreateProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.post<CreateProjectResponse, CreateProjectRequest>({
	name: "createProject",
	request: CreateProjectRequestSchema,
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: (body) => ({ url: "/projects", method: "POST", body }),
	handler: async ({ user, body }) => {
		const prismaProject = await createProject(body, user.id);
		const project = serializeProject(prismaProject, user.id);
		return { project };
	},
});
