import {
	createProject,
	getProjects,
	serializeProject,
} from "@pointwise/lib/api/projects";
import {
	handleProtectedRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import { CreateProjectRequestSchema } from "@pointwise/lib/validation/projects-schema";

export async function GET(req: Request) {
	return handleProtectedRoute(req, async ({ user }) => {
		const prismaProjects = await getProjects(user.id);
		const projects = prismaProjects.map((project) =>
			serializeProject(project, user.id),
		);
		return jsonResponse({ projects });
	});
}

export async function POST(req: Request) {
	return handleProtectedRoute(
		req,
		async ({ user, body }) => {
			const prismaProject = await createProject(body, user.id);
			const project = serializeProject(prismaProject, user.id);
			return jsonResponse({ project });
		},
		CreateProjectRequestSchema,
	);
}
