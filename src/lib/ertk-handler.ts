import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { UpstashRateLimitAdapter } from "@pointwise/lib/rate-limit-adapter";
import { logServerError } from "@pointwise/lib/server-logger";
import { Prisma } from "@prisma/client";
import { configureHandler, defaultKeyFn } from "ertk/next";
import { getServerSession } from "next-auth";

export const createRouteHandler = configureHandler({
	rateLimit: {
		windowMs: 600_000, // 10 minutes
		max: 250,
		adapter: new UpstashRateLimitAdapter(),
		keyFn: (req, user) => user?.id ?? defaultKeyFn(req),
	},
	auth: {
		getUser: async () => {
			const session = await getServerSession(authOptions);
			const email = session?.user?.email;
			if (!email) return null;

			// Check custom session expiry
			if (session.expiresAt && Date.now() >= session.expiresAt) return null;

			// Check if session is pending 2FA — block API access
			if (session.pendingTwoFactor) return null;

			const user = await prisma.user.findUnique({
				where: { email },
				select: { id: true, email: true, name: true, image: true },
			});

			if (!user?.email) return null;

			// Validate device session (check if jti is still valid)
			if (session.jti) {
				const deviceSession = await prisma.deviceSession.findUnique({
					where: { jti: session.jti },
					select: { id: true },
				});
				// If a jti exists but no matching device session, the session was revoked
				if (!deviceSession) {
					// Allow if no device sessions exist at all for this user (legacy sessions)
					const hasAnyDeviceSession = await prisma.deviceSession.count({
						where: { userId: user.id },
					});
					if (hasAnyDeviceSession > 0) {
						return null;
					}
				}
			}

			return {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
			};
		},
	},
	errorHandlers: [
		(error) => {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				logServerError("Prisma error", error, { code: error.code });

				if (error.code === "P2002") {
					return Response.json(
						{ error: "A record with this value already exists" },
						{ status: 409 },
					);
				}

				if (error.code === "P2025") {
					return Response.json({ error: "Record not found" }, { status: 404 });
				}

				return Response.json(
					{ error: "Database operation failed" },
					{ status: 500 },
				);
			}

			if (error instanceof Prisma.PrismaClientValidationError) {
				logServerError("Prisma validation error", error);
				return Response.json(
					{ error: "Invalid data provided" },
					{ status: 400 },
				);
			}

			return null;
		},
	],
});
