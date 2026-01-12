import { z } from "zod";

const ID_SCHEMA = z.string();
const PROJECT_ROLE_SCHEMA = z.enum(["ADMIN", "USER", "VIEWER"]);

export const InviteRequestSchema = z.object({
	inviteeId: ID_SCHEMA,
	role: PROJECT_ROLE_SCHEMA,
});

export const InviteResponseSchema = z.object({
	success: z.boolean(),
});

export type InviteRequest = z.infer<typeof InviteRequestSchema>;
export type InviteResponse = z.infer<typeof InviteResponseSchema>;
