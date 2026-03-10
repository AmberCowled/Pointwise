import crypto from "node:crypto";
import { authOptions } from "@pointwise/lib/auth";
import { sendEmail } from "@pointwise/lib/email/send";
import { renderNewDeviceLoginEmail } from "@pointwise/lib/email/templates/new-device-login";
import prisma from "@pointwise/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

function resolveLocation(headersList: Headers): string | null {
	// Vercel provides geolocation headers automatically
	const city = headersList.get("x-vercel-ip-city");
	const countryCode = headersList.get("x-vercel-ip-country");
	if (!countryCode) return null;

	const countryName = new Intl.DisplayNames(["en"], { type: "region" }).of(
		countryCode,
	);
	const country = countryName ?? countryCode;

	if (city) return `${decodeURIComponent(city)}, ${country}`;
	return country;
}

function parseDeviceName(userAgent: string | null): string {
	if (!userAgent) return "Unknown device";

	// Extract browser
	let browser = "Unknown browser";
	if (userAgent.includes("Firefox/")) browser = "Firefox";
	else if (userAgent.includes("Edg/")) browser = "Edge";
	else if (userAgent.includes("Chrome/")) browser = "Chrome";
	else if (userAgent.includes("Safari/")) browser = "Safari";
	else if (userAgent.includes("Opera/") || userAgent.includes("OPR/"))
		browser = "Opera";

	// Extract OS
	let os = "Unknown OS";
	if (userAgent.includes("Windows")) os = "Windows";
	else if (userAgent.includes("Mac OS")) os = "macOS";
	else if (userAgent.includes("Linux")) os = "Linux";
	else if (userAgent.includes("Android")) os = "Android";
	else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
		os = "iOS";

	return `${browser} on ${os}`;
}

async function detectNewDeviceAndNotify(
	userId: string,
	jti: string,
	ipAddress: string | null,
	deviceName: string,
	location: string | null,
) {
	if (!ipAddress) return;

	// Find existing sessions with IP data (excluding the current stub)
	const existingSessions = await prisma.deviceSession.findMany({
		where: {
			userId,
			jti: { not: jti },
			ipAddress: { not: null },
		},
		select: { ipAddress: true },
	});

	// No prior sessions with IP data — first login, skip notification
	if (existingSessions.length === 0) return;

	// Check if any existing session has the same IP
	const knownIp = existingSessions.some((s) => s.ipAddress === ipAddress);
	if (knownIp) return;

	// New device detected — generate revoke token
	const rawToken = crypto.randomUUID();
	const hashedToken = crypto
		.createHash("sha256")
		.update(rawToken)
		.digest("hex");

	await prisma.verificationToken.create({
		data: {
			identifier: `device-revoke:${jti}`,
			token: hashedToken,
			expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	});

	// Fetch user email
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true },
	});
	if (!user?.email) return;

	const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
	const revokeUrl = `${baseUrl}/revoke-device?token=${rawToken}`;

	const { subject, html } = renderNewDeviceLoginEmail({
		deviceName,
		ipAddress,
		location,
		time: new Date().toLocaleString("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}),
		revokeUrl,
	});

	await sendEmail({ to: user.email, subject, html });
}

export async function POST(_request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id || !session.jti) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const headersList = await headers();
		const userAgent = headersList.get("user-agent");
		const forwarded = headersList.get("x-forwarded-for");
		const ipAddress = forwarded?.split(",")[0]?.trim() ?? null;

		const deviceName = parseDeviceName(userAgent);
		const location = resolveLocation(headersList);

		// Check for new device before upserting (so the current session
		// doesn't appear in the "existing sessions" query)
		try {
			await detectNewDeviceAndNotify(
				session.user.id,
				session.jti,
				ipAddress,
				deviceName,
				location,
			);
		} catch {
			// Email failure must not break login
		}

		// Upsert to handle duplicate calls
		await prisma.deviceSession.upsert({
			where: { jti: session.jti },
			create: {
				userId: session.user.id,
				jti: session.jti,
				deviceName,
				ipAddress,
				location,
				userAgent,
				lastActiveAt: new Date(),
			},
			update: {
				lastActiveAt: new Date(),
				deviceName,
				ipAddress,
				location,
			},
		});

		// Clean up stale sessions from the same device (e.g. user signed out
		// and back in, creating a new jti but leaving the old record orphaned).
		// Match on both userAgent and ipAddress for more precise identification.
		if (userAgent && ipAddress) {
			await prisma.deviceSession.deleteMany({
				where: {
					userId: session.user.id,
					jti: { not: session.jti },
					userAgent,
					ipAddress,
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Register session error:", error);
		return NextResponse.json(
			{ error: "Failed to register session" },
			{ status: 500 },
		);
	}
}
