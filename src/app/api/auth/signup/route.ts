import { generateUniqueDisplayName } from "@pointwise/lib/api/users";
import prisma from "@pointwise/lib/prisma";
import { checkRateLimit } from "@pointwise/lib/rate-limit";
import { parseSignupBody } from "@pointwise/lib/validation/auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

export const runtime = "nodejs";

export async function POST(req: Request) {
	try {
		const rateLimited = await checkRateLimit(req, {
			windowMs: 600_000,
			max: 10,
		});
		if (rateLimited) return rateLimited;

		const rawBody = await req.json().catch(() => ({}));
		const parsed = parseSignupBody(rawBody);
		if (!parsed.success) {
			return Response.json({ error: parsed.error }, { status: parsed.status });
		}

		const { name, email, password } = parsed.data;

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return Response.json({ error: "Email already in use" }, { status: 409 });
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const displayName = await generateUniqueDisplayName();

		const user = await prisma.user.create({
			data: { name: name ?? null, email, passwordHash, displayName },
			select: { id: true, email: true, name: true, displayName: true },
		});

		return Response.json({ user }, { status: 201 });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return Response.json(
					{ error: "Email already in use" },
					{ status: 409 },
				);
			}
		}
		console.error("Signup error:", error);
		return Response.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}
