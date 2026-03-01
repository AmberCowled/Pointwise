import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const rpID = process.env.WEBAUTHN_RP_ID ?? "localhost";
const origin = process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;
		const body = await request.json();

		// Retrieve the stored challenge
		const identifier = `webauthn-reg:${userId}`;
		const challengeToken = await prisma.verificationToken.findFirst({
			where: {
				identifier,
				expires: { gt: new Date() },
			},
		});

		if (!challengeToken) {
			return NextResponse.json(
				{ error: "Challenge expired or not found" },
				{ status: 400 },
			);
		}

		const verification = await verifyRegistrationResponse({
			response: body,
			expectedChallenge: challengeToken.token,
			expectedOrigin: origin,
			expectedRPID: rpID,
		});

		if (!verification.verified || !verification.registrationInfo) {
			return NextResponse.json(
				{ error: "Verification failed" },
				{ status: 400 },
			);
		}

		const { credential } = verification.registrationInfo;

		// Store the credential
		await prisma.webAuthnCredential.create({
			data: {
				userId,
				credentialId: credential.id,
				publicKey: Buffer.from(credential.publicKey).toString("base64url"),
				counter: credential.counter,
				transports: body.response?.transports ?? [],
			},
		});

		// Enable 2FA on the user
		await prisma.user.update({
			where: { id: userId },
			data: { twoFactorEnabled: true },
		});

		// Clean up challenge
		await prisma.verificationToken.delete({
			where: { id: challengeToken.id },
		});

		return NextResponse.json({ verified: true });
	} catch (error) {
		console.error("WebAuthn register-verify error:", error);
		return NextResponse.json({ error: "Verification failed" }, { status: 500 });
	}
}
