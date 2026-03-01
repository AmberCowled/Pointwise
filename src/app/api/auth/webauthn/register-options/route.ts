import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const rpName = process.env.WEBAUTHN_RP_NAME ?? "Pointwise";
const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";

export async function POST() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		// Get existing credentials to exclude
		const existingCredentials = await prisma.webAuthnCredential.findMany({
			where: { userId },
			select: { credentialId: true, transports: true },
		});

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, displayName: true },
		});

		const options = await generateRegistrationOptions({
			rpName,
			rpID,
			userName: user?.email ?? user?.displayName ?? userId,
			userDisplayName: user?.displayName ?? user?.email ?? "User",
			attestationType: "none",
			excludeCredentials: existingCredentials.map((c) => ({
				id: c.credentialId,
				transports: c.transports as AuthenticatorTransport[],
			})),
			authenticatorSelection: {
				residentKey: "preferred",
				userVerification: "preferred",
			},
		});

		// Store challenge in VerificationToken (expires in 5 minutes)
		const identifier = `webauthn-reg:${userId}`;
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
		console.error("WebAuthn register-options error:", error);
		return NextResponse.json(
			{ error: "Failed to generate registration options" },
			{ status: 500 },
		);
	}
}
