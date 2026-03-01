import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
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

		// Retrieve challenge
		const identifier = `webauthn-auth:${userId}`;
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

		// Find the credential being used
		const credential = await prisma.webAuthnCredential.findUnique({
			where: { credentialId: body.id },
		});

		if (!credential || credential.userId !== userId) {
			return NextResponse.json(
				{ error: "Credential not found" },
				{ status: 400 },
			);
		}

		const verification = await verifyAuthenticationResponse({
			response: body,
			expectedChallenge: challengeToken.token,
			expectedOrigin: origin,
			expectedRPID: rpID,
			credential: {
				id: credential.credentialId,
				publicKey: Buffer.from(credential.publicKey, "base64url"),
				counter: credential.counter,
				transports: credential.transports as AuthenticatorTransport[],
			},
		});

		if (!verification.verified) {
			return NextResponse.json(
				{ error: "Authentication failed" },
				{ status: 400 },
			);
		}

		// Update credential counter
		await prisma.webAuthnCredential.update({
			where: { id: credential.id },
			data: {
				counter: verification.authenticationInfo.newCounter,
			},
		});

		// Set twoFactorVerifiedAt so the JWT callback can clear pendingTwoFactor
		await prisma.user.update({
			where: { id: userId },
			data: { twoFactorVerifiedAt: new Date() },
		});

		// Clean up challenge
		await prisma.verificationToken.delete({
			where: { id: challengeToken.id },
		});

		return NextResponse.json({ verified: true });
	} catch (error) {
		console.error("WebAuthn auth-verify error:", error);
		return NextResponse.json(
			{ error: "Authentication verification failed" },
			{ status: 500 },
		);
	}
}
