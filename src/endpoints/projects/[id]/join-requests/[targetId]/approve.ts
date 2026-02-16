import { approveJoinRequest } from "@pointwise/lib/api/joinRequests";
import { serializeProject } from "@pointwise/lib/api/projects";
import { endpoint } from "@pointwise/lib/ertk";
import type { GetProjectResponse } from "@pointwise/lib/validation/projects-schema";
import { z } from "zod";

const ApproveJoinRequestSchema = z.object({
	role: z.enum(["ADMIN", "USER", "VIEWER"]),
});

export default endpoint.patch<
	{ success: boolean; project: GetProjectResponse["project"] },
	{ projectId: string; userId: string; role: "ADMIN" | "USER" | "VIEWER" }
>({
	name: "approveJoinRequest",
	request: ApproveJoinRequestSchema,
	tags: { invalidates: ["JoinRequests", "Projects"] },
	protected: true,
	query: ({ projectId, userId, role }) => ({
		url: `/projects/${projectId}/join-requests/${userId}/approve`,
		method: "PATCH",
		body: { role },
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await approveJoinRequest(
			params.id,
			user.id,
			params.targetId,
			body.role,
		);
		const project = serializeProject(prismaProject, user.id);
		return { success: true, project };
	},
});
