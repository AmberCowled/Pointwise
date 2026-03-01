import crypto from "node:crypto";
import prisma from "@pointwise/lib/prisma";
import { ResetPasswordSchema } from "@pointwise/lib/validation/password-reset-schema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = ResetPasswordSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request data" },
				{ status: 400 },
			);
		}

		const { email, token, password } = parsed.data;

		// Hash the incoming token to compare with stored hash
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const verificationToken = await prisma.verificationToken.findFirst({
			where: {
				identifier: email,
				token: hashedToken,
				expires: { gt: new Date() },
			},
		});

		if (!verificationToken) {
			return NextResponse.json(
				{ error: "Invalid or expired reset token" },
				{ status: 400 },
			);
		}

		// Hash the new password
		const passwordHash = await bcrypt.hash(password, 12);

		// Update user password
		await prisma.user.update({
			where: { email },
			data: { passwordHash },
		});

		// Delete the used token
		await prisma.verificationToken.delete({
			where: { id: verificationToken.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Reset password error:", error);
		return NextResponse.json(
			{ error: "Failed to reset password" },
			{ status: 500 },
		);
	}
}
