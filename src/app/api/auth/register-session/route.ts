import { authOptions } from "@pointwise/lib/auth";
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

		// Clean up stale sessions from the same browser (e.g. user signed out
		// and back in, creating a new jti but leaving the old record orphaned)
		if (userAgent) {
			await prisma.deviceSession.deleteMany({
				where: {
					userId: session.user.id,
					jti: { not: session.jti },
					userAgent,
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
