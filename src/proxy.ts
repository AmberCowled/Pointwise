import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const { pathname } = request.nextUrl;

	// If user has pending 2FA and is trying to access protected routes,
	// redirect them to the 2FA page
	if (token?.pendingTwoFactor) {
		// Allow access to 2FA page, auth API routes, and static assets
		if (
			pathname === "/two-factor" ||
			pathname.startsWith("/api/auth") ||
			pathname.startsWith("/_next") ||
			pathname.startsWith("/favicon") ||
			pathname === "/manifest.json"
		) {
			return NextResponse.next();
		}

		const twoFactorUrl = new URL("/two-factor", request.url);
		return NextResponse.redirect(twoFactorUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except static files and images
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
