import crypto from "node:crypto";
import { sendEmail } from "@pointwise/lib/email/send";
import { renderPasswordResetEmail } from "@pointwise/lib/email/templates/password-reset";
import prisma from "@pointwise/lib/prisma";
import { checkRateLimit } from "@pointwise/lib/rate-limit";
import { ForgotPasswordSchema } from "@pointwise/lib/validation/password-reset-schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const rateLimited = await checkRateLimit(request, {
			windowMs: 600_000,
			max: 10,
		});
		if (rateLimited) return rateLimited;

		const body = await request.json();
		const parsed = ForgotPasswordSchema.safeParse(body);

		if (!parsed.success) {
			// Always return 200 to prevent email enumeration
			return NextResponse.json({ success: true });
		}

		const { email } = parsed.data;

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true },
		});

		if (!user?.email) {
			// User doesn't exist, but return 200 anyway
			return NextResponse.json({ success: true });
		}

		// Delete any existing tokens for this email
		await prisma.verificationToken.deleteMany({
			where: { identifier: email },
		});

		// Generate token and store SHA-256 hash
		const rawToken = crypto.randomUUID();
		const hashedToken = crypto
			.createHash("sha256")
			.update(rawToken)
			.digest("hex");

		await prisma.verificationToken.create({
			data: {
				identifier: email,
				token: hashedToken,
				expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
			},
		});

		// Build reset URL with raw token
		const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
		const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

		const { subject, html } = renderPasswordResetEmail({ resetUrl });

		await sendEmail({ to: email, subject, html });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Forgot password error:", error);
		// Still return 200 to prevent information leakage
		return NextResponse.json({ success: true });
	}
}
