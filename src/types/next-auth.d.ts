import type { DefaultJWT, DefaultSession } from "next-auth";

declare module "next-auth" {
	interface User {
		rememberMe?: boolean;
	}

	interface Session extends DefaultSession {
		user?: {
			id?: string;
		} & DefaultSession["user"];
		remember?: boolean;
		expiresAt?: number;
		jti?: string;
		pendingTwoFactor?: boolean;
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		id?: string;
		expiresAt?: number;
		jti?: string;
		pendingTwoFactor?: boolean;
	}
}
