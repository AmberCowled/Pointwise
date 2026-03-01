import { z } from "zod";

export const DeviceSessionSchema = z.object({
	id: z.string(),
	jti: z.string(),
	deviceName: z.string().nullable(),
	ipAddress: z.string().nullable(),
	location: z.string().nullable(),
	lastActiveAt: z.string(),
	createdAt: z.string(),
});

export const AccountInfoSchema = z.object({
	providers: z.array(z.string()),
	hasPassword: z.boolean(),
	twoFactorEnabled: z.boolean(),
	email: z.string().nullable(),
});

export const AccountInfoResponseSchema = z.object({
	accountInfo: AccountInfoSchema,
});

export const DeviceSessionsResponseSchema = z.object({
	sessions: z.array(DeviceSessionSchema),
});

export const RevokeAllSessionsResponseSchema = z.object({
	success: z.boolean(),
});

export const DeletePreviewSchema = z.object({
	soleAdminProjects: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			memberCount: z.number(),
			taskCount: z.number(),
		}),
	),
	email: z.string(),
});

export const DeletePreviewResponseSchema = z.object({
	preview: DeletePreviewSchema,
});

export type DeviceSession = z.infer<typeof DeviceSessionSchema>;
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type AccountInfoResponse = z.infer<typeof AccountInfoResponseSchema>;
export type DeviceSessionsResponse = z.infer<
	typeof DeviceSessionsResponseSchema
>;
export type RevokeAllSessionsResponse = z.infer<
	typeof RevokeAllSessionsResponseSchema
>;
export type DeletePreview = z.infer<typeof DeletePreviewSchema>;
export type DeletePreviewResponse = z.infer<typeof DeletePreviewResponseSchema>;
