import { errorResponse, handleRoute, jsonResponse } from "@pointwise/lib/api/route-handler";
import { authOptions } from "@pointwise/lib/auth";
import { DateTimeDefaults } from "@pointwise/lib/datetime";
import prisma from "@pointwise/lib/prisma";
import { parsePreferencesBody } from "@pointwise/lib/validation/user";
import { getServerSession } from "next-auth";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
	return handleRoute(request, async () => {
		const session = await getServerSession(authOptions);
		const email = session?.user?.email;

		if (!email) {
			return errorResponse("Unauthorized", 401);
		}

		const rawBody = await request.json().catch(() => ({}));
		const parsed = parsePreferencesBody(rawBody);
		if (!parsed.success) {
			return errorResponse(parsed.error, parsed.status);
		}

		const { locale, timeZone } = parsed.data;

		await prisma.user.update({
			where: { email },
			data: {
				preferredLocale: locale,
				preferredTimeZone: timeZone,
			},
		});

		const payload = {
			locale: locale || DateTimeDefaults.locale,
			timeZone: timeZone || DateTimeDefaults.timeZone,
		};

		const response = jsonResponse(payload);
		const secure = process.env.NODE_ENV === "production";

		response.cookies.set("pw-locale", locale, {
			path: "/",
			maxAge: ONE_YEAR_SECONDS,
			sameSite: "lax",
			secure,
		});

		response.cookies.set("pw-timezone", timeZone, {
			path: "/",
			maxAge: ONE_YEAR_SECONDS,
			sameSite: "lax",
			secure,
		});

		return response;
	});
}
