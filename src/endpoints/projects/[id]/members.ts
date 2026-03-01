import { getProjectMembers } from "@pointwise/lib/api/members";
import type { GetProjectMembersResponse } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.get<GetProjectMembersResponse, string>({
	name: "getProjectMembers",
	tags: { provides: ["Members"] },
	protected: true,
	maxRetries: 2,
	query: (projectId) => `/projects/${projectId}/members`,
	handler: async ({ user, params }) => {
		const members = await getProjectMembers(params.id, user.id);
		return { members };
	},
});
