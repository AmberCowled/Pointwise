import { ApiError } from "@pointwise/lib/api/errors";
import { getProjectInvites } from "@pointwise/lib/api/invites";
import { getProject } from "@pointwise/lib/api/projects";
import { endpoint } from "@pointwise/lib/ertk";

export default endpoint.get<
	{
		invites: Array<{
			id: string;
			inviterId: string;
			invitedUserId: string;
			projectId: string;
			inviteRole: "ADMIN" | "USER" | "VIEWER";
			createdAt: string;
			updatedAt: string;
			inviter: { id: string; name: string | null };
			invitedUser: { id: string; name: string | null };
		}>;
	},
	string
>({
	name: "getProjectInvites",
	tags: { provides: ["Invites"] },
	protected: true,
	query: (projectId) => `/projects/${projectId}/invites`,
	handler: async ({ user, params }) => {
		const project = await getProject(params.id, user.id);
		if (!project.adminUserIds.includes(user.id)) {
			throw new ApiError(
				"Forbidden: You must be an admin to view invites",
				403,
			);
		}
		const invites = await getProjectInvites(params.id);
		return { invites };
	},
});
