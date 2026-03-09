import { deleteProject } from "@pointwise/lib/api/projects";
import prisma from "@pointwise/lib/prisma";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { dispatch } from "@pointwise/lib/realtime/publish";
import type { DeleteProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.delete<DeleteProjectResponse, string>({
	name: "deleteProject",
	tags: { invalidates: ["Projects"] },
	protected: true,
	query: (projectId) => ({ url: `/projects/${projectId}`, method: "DELETE" }),
	handler: async ({ user, params }) => {
		const project = await prisma.project.findUnique({
			where: { id: params.id },
			select: {
				name: true,
				adminUserIds: true,
				projectUserIds: true,
				viewerUserIds: true,
			},
		});

		const result = await deleteProject(params.id, user.id);

		if (project) {
			try {
				const allMembers = [
					...project.adminUserIds,
					...project.projectUserIds,
					...project.viewerUserIds,
				];
				const recipients = allMembers.filter((id) => id !== user.id);
				if (recipients.length > 0) {
					await dispatch(
						"PROJECT_DELETED",
						user.id,
						{ projectName: project.name },
						recipients,
					);
				}
			} catch (error) {
				logDispatchError("project deleted notification", error);
			}
		}

		return { success: result };
	},
});
