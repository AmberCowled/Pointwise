import prisma from "@pointwise/lib/prisma";
import type { RevokeAllSessionsResponse } from "@pointwise/lib/validation/account-schema";
import { endpoint } from "ertk";
import { z } from "zod";

const RevokeAllRequestSchema = z.object({
	currentJti: z.string(),
});

export default endpoint.post<RevokeAllSessionsResponse, { currentJti: string }>(
	{
		name: "revokeAllDeviceSessions",
		request: RevokeAllRequestSchema,
		tags: { invalidates: ["DeviceSessions"] },
		protected: true,
		query: (body) => ({
			url: "/user/device-sessions/revoke-all",
			method: "POST",
			body,
		}),
		handler: async ({ user, body }) => {
			await prisma.deviceSession.deleteMany({
				where: {
					userId: user.id,
					jti: { not: body.currentJti },
				},
			});

			return { success: true };
		},
	},
);
