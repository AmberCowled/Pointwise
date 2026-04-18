import { getProject, serializeProject } from "@pointwise/lib/api/projects";
import { getProjectMemberLimitInfo } from "@pointwise/lib/credits/member-limits";
import { getOwnerStorageInfo } from "@pointwise/lib/credits/storage";
import type { GetProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.get<GetProjectResponse, string>({
	name: "getProject",
	tags: { provides: ["Projects"] },
	protected: true,
	maxRetries: 2,
	query: (projectId) => `/projects/${projectId}`,
	handler: async ({ user, params }) => {
		const prismaProject = await getProject(params.id, user.id);
		const memberLimitInfo = await getProjectMemberLimitInfo(prismaProject);
		const storageInfo = await getOwnerStorageInfo(prismaProject.ownerId);
		const project = serializeProject(
			prismaProject,
			user.id,
			memberLimitInfo,
			storageInfo,
		);
		return { project };
	},
});
