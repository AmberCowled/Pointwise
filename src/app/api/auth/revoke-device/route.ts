import crypto from "node:crypto";
import prisma from "@pointwise/lib/prisma";
import { checkRateLimit } from "@pointwise/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const rateLimited = await checkRateLimit(request, {
			windowMs: 600_000,
			max: 10,
		});
		if (rateLimited) return rateLimited;

		const body = await request.json();
		const token = typeof body.token === "string" ? body.token : null;

		if (!token) {
			return NextResponse.json({ error: "Missing token" }, { status: 400 });
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const verificationToken = await prisma.verificationToken.findFirst({
			where: {
				token: hashedToken,
				identifier: { startsWith: "device-revoke:" },
				expires: { gt: new Date() },
			},
		});

		if (!verificationToken) {
			return NextResponse.json(
				{ error: "Invalid or expired link" },
				{ status: 400 },
			);
		}

		// Extract jti from identifier "device-revoke:{jti}"
		const jti = verificationToken.identifier.replace("device-revoke:", "");

		// Find the device session before deleting so we can return its info
		const deviceSession = await prisma.deviceSession.findUnique({
			where: { jti },
			select: {
				deviceName: true,
				ipAddress: true,
				location: true,
				createdAt: true,
			},
		});

		// Delete the device session (if it still exists)
		if (deviceSession) {
			await prisma.deviceSession.delete({ where: { jti } });
		}

		// Delete the used verification token
		await prisma.verificationToken.delete({
			where: { id: verificationToken.id },
		});

		return NextResponse.json({
			success: true,
			device: deviceSession
				? {
						deviceName: deviceSession.deviceName,
						ipAddress: deviceSession.ipAddress,
						location: deviceSession.location,
						createdAt: deviceSession.createdAt.toISOString(),
					}
				: null,
		});
	} catch (error) {
		console.error("Revoke device error:", error);
		return NextResponse.json(
			{ error: "Failed to revoke device" },
			{ status: 500 },
		);
	}
}
