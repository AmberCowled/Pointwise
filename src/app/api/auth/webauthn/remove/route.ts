import { authOptions } from "@pointwise/lib/auth";
import prisma from "@pointwise/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function DELETE(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		// Check for optional credentialId in body to remove a specific credential
		let credentialId: string | null = null;
		try {
			const body = await request.json();
			credentialId = body.credentialId ?? null;
		} catch {
			// No body means remove all
		}

		if (credentialId) {
			// Remove specific credential
			await prisma.webAuthnCredential.deleteMany({
				where: { credentialId, userId },
			});
		} else {
			// Remove all credentials
			await prisma.webAuthnCredential.deleteMany({
				where: { userId },
			});
		}

		// Check if any credentials remain
		const remaining = await prisma.webAuthnCredential.count({
			where: { userId },
		});

		if (remaining === 0) {
			await prisma.user.update({
				where: { id: userId },
				data: { twoFactorEnabled: false },
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("WebAuthn remove error:", error);
		return NextResponse.json(
			{ error: "Failed to remove credential" },
			{ status: 500 },
		);
	}
}
