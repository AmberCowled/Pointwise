import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const isProd = process.env.NODE_ENV === "production";

const csp = [
	"default-src 'self'",
	// unsafe-eval removed — neither React 19 nor Next.js require it in production.
	// unsafe-inline kept until Next.js supports nonce propagation in proxy.ts (Node.js runtime).
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' blob: data: https://lh3.googleusercontent.com https://utfs.io https://*.utfs.io https://ufs.sh https://*.ufs.sh",
	"font-src 'self'",
	"connect-src 'self' https://realtime.ably.io https://rest.ably.io https://*.ably.io https://*.ably.net wss://realtime.ably.io wss://*.ably.io wss://*.ably.net https://ingest.uploadthing.com https://*.uploadthing.com",
	"worker-src 'self'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

export async function proxy(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const { pathname } = request.nextUrl;

	const isPublicRoute =
		pathname === "/" ||
		pathname === "/reset-password" ||
		pathname === "/revoke-device" ||
		pathname === "/two-factor" ||
		pathname.startsWith("/api/");

	// Redirect unauthenticated users to landing page for protected routes
	if (!token && !isPublicRoute) {
		const loginUrl = new URL("/", request.url);
		const response = NextResponse.redirect(loginUrl);
		if (isProd) response.headers.set("Content-Security-Policy", csp);
		return response;
	}

	// Enforce custom session expiry (short "non-remembered" sessions).
	// Cookie deletion prevents redirect loops with the expired JWT.
	if (
		token?.expiresAt &&
		typeof token.expiresAt === "number" &&
		Date.now() >= token.expiresAt &&
		!isPublicRoute
	) {
		const loginUrl = new URL("/", request.url);
		const response = NextResponse.redirect(loginUrl);
		const cookieName =
			process.env.NODE_ENV === "production"
				? "__Secure-next-auth.session-token"
				: "next-auth.session-token";
		response.cookies.delete(cookieName);
		if (isProd) response.headers.set("Content-Security-Policy", csp);
		return response;
	}

	// If user has pending 2FA and is trying to access protected routes,
	// redirect them to the 2FA page
	if (token?.pendingTwoFactor && !isPublicRoute) {
		const twoFactorUrl = new URL("/two-factor", request.url);
		const response = NextResponse.redirect(twoFactorUrl);
		if (isProd) response.headers.set("Content-Security-Policy", csp);
		return response;
	}

	const response = NextResponse.next();
	if (isProd) response.headers.set("Content-Security-Policy", csp);
	return response;
}

export const config = {
	matcher: [
		// Match all paths except static files, images, and manifest
		"/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
