import { acceptInvite } from "@pointwise/lib/api/invites";
import { serializeProject } from "@pointwise/lib/api/projects";
import { endpoint } from "@pointwise/lib/ertk";
import type { Project } from "@pointwise/lib/validation/projects-schema";

export default endpoint.post<{ success: boolean; project: Project }, string>({
	name: "acceptInvite",
	tags: { invalidates: ["Invites", "Projects"] },
	protected: true,
	query: (inviteId) => ({ url: `/invites/${inviteId}/accept`, method: "POST" }),
	handler: async ({ user, params }) => {
		const prismaProject = await acceptInvite(params.id, user.id);
		const project = serializeProject(prismaProject, user.id);
		return { success: true, project };
	},
});
