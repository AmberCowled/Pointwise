import {
	errorResponse,
	handleRoute,
	jsonResponse,
} from "@pointwise/lib/api/route-handler";
import prisma from "@pointwise/lib/prisma";
import { parseSignupBody } from "@pointwise/lib/validation/auth";
import bcrypt from "bcrypt";

export const runtime = "nodejs";

export async function POST(req: Request) {
	return handleRoute(req, async () => {
		const rawBody = await req.json().catch(() => ({}));
		const parsed = parseSignupBody(rawBody);
		if (!parsed.success) {
			return errorResponse(parsed.error, parsed.status);
		}

		const { name, email, password } = parsed.data;

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return errorResponse("Email already in use", 409);
		}

		const passwordHash = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: { name: name ?? null, email, passwordHash },
			select: { id: true, email: true, name: true },
		});

		return jsonResponse({ user }, 201);
	});
}
