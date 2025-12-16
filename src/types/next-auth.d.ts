import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
	interface Session extends DefaultSession {
		remember?: boolean;
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		shortSession?: boolean;
	}
}
