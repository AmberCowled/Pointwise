import prisma from "@pointwise/lib/prisma";
import type { AccountInfoResponse } from "@pointwise/lib/validation/account-schema";
import { endpoint } from "ertk";

export default endpoint.get<AccountInfoResponse, void>({
	name: "getAccountInfo",
	tags: { provides: ["AccountInfo"] },
	protected: true,
	maxRetries: 2,
	query: () => "/user/account-info",
	handler: async ({ user }) => {
		const [accounts, dbUser] = await Promise.all([
			prisma.account.findMany({
				where: { userId: user.id },
				select: { provider: true },
			}),
			prisma.user.findUnique({
				where: { id: user.id },
				select: {
					passwordHash: true,
					twoFactorEnabled: true,
					email: true,
				},
			}),
		]);

		return {
			accountInfo: {
				providers: accounts.map((a) => a.provider),
				hasPassword: !!dbUser?.passwordHash,
				twoFactorEnabled: dbUser?.twoFactorEnabled ?? false,
				email: dbUser?.email ?? null,
			},
		};
	},
});
