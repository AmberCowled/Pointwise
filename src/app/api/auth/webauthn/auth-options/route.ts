import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";

export async function POST() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		// Get user's registered credentials
		const credentials = await prisma.webAuthnCredential.findMany({
			where: { userId },
			select: { credentialId: true, transports: true },
		});

		if (credentials.length === 0) {
			return NextResponse.json(
				{ error: "No credentials registered" },
				{ status: 400 },
			);
		}

		const options = await generateAuthenticationOptions({
			rpID,
			allowCredentials: credentials.map((c) => ({
				id: c.credentialId,
				transports: c.transports as AuthenticatorTransport[],
			})),
			userVerification: "preferred",
		});

		// Store challenge
		const identifier = `webauthn-auth:${userId}`;
		await prisma.verificationToken.deleteMany({ where: { identifier } });
		await prisma.verificationToken.create({
			data: {
				identifier,
				token: options.challenge,
				expires: new Date(Date.now() + 5 * 60 * 1000),
			},
		});

		return NextResponse.json(options);
	} catch (error) {
		console.error("WebAuthn auth-options error:", error);
		return NextResponse.json(
			{ error: "Failed to generate authentication options" },
			{ status: 500 },
		);
	}
}
