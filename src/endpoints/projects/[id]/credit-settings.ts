import {
	serializeProject,
	updateCreditSettings,
} from "@pointwise/lib/api/projects";
import { logDispatchError } from "@pointwise/lib/realtime/log";
import { emitEvent } from "@pointwise/lib/realtime/publish";
import type { UpdateCreditSettingsResponse } from "@pointwise/lib/validation/projects-schema";
import { UpdateCreditSettingsRequestSchema } from "@pointwise/lib/validation/projects-schema";
import { endpoint } from "ertk";

export default endpoint.patch<
	UpdateCreditSettingsResponse,
	{
		projectId: string;
		data: { creditPolicy: string; memberCreditCap: number | null };
	}
>({
	name: "updateCreditSettings",
	request: UpdateCreditSettingsRequestSchema,
	tags: { invalidates: ["Projects", "CreditBalance"] },
	protected: true,
	query: ({ projectId, data }) => ({
		url: `/projects/${projectId}/credit-settings`,
		method: "PATCH",
		body: data,
	}),
	handler: async ({ user, body, params }) => {
		const prismaProject = await updateCreditSettings(params.id, body, user.id);
		const project = serializeProject(prismaProject, user.id);

		try {
			const allMembers = [
				...prismaProject.adminUserIds,
				...prismaProject.projectUserIds,
				...prismaProject.viewerUserIds,
			];
			const recipients = allMembers.filter((id) => id !== user.id);
			if (recipients.length > 0) {
				await emitEvent(
					"PROJECT_MUTATED",
					{ projectId: params.id },
					recipients,
				);
			}
		} catch (error) {
			logDispatchError("credit settings update event", error);
		}

		return { project };
	},
});
