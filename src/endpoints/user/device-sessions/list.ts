import prisma from "@pointwise/lib/prisma";
import type { DeviceSessionsResponse } from "@pointwise/lib/validation/account-schema";
import { endpoint } from "ertk";

export default endpoint.get<DeviceSessionsResponse, void>({
	name: "getDeviceSessions",
	tags: { provides: ["DeviceSessions"] },
	protected: true,
	query: () => "/user/device-sessions",
	handler: async ({ user }) => {
		const sessions = await prisma.deviceSession.findMany({
			where: { userId: user.id },
			orderBy: { lastActiveAt: "desc" },
			select: {
				id: true,
				jti: true,
				deviceName: true,
				ipAddress: true,
				location: true,
				lastActiveAt: true,
				createdAt: true,
			},
		});

		return {
			sessions: sessions.map((s) => ({
				...s,
				lastActiveAt: s.lastActiveAt.toISOString(),
				createdAt: s.createdAt.toISOString(),
			})),
		};
	},
});
