import crypto from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { generateUniqueDisplayName } from "@pointwise/lib/api/users";
import prisma from "@pointwise/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const prismaAdapter = PrismaAdapter(prisma) as Adapter;

/** Duration for "remembered" sessions (14 days in seconds). */
const REMEMBERED_MAX_AGE = 14 * 24 * 60 * 60;

/** Duration for "non-remembered" sessions (24 hours in seconds). */
const SHORT_MAX_AGE = 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
	adapter: {
		...prismaAdapter,
		async createUser(user: Omit<AdapterUser, "id">) {
			const displayName = await generateUniqueDisplayName();
			return prisma.user.create({
				data: {
					...user,
					displayName,
				},
			}) as unknown as AdapterUser;
		},
	},

	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
			authorization: { params: { scope: "openid email profile" } },
			allowDangerousEmailAccountLinking: true,
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID ?? "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
			authorization: { params: { scope: "read:user user:email" } },
			allowDangerousEmailAccountLinking: true,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
				remember: { label: "Remember me", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) return null;

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
						emailVerified: true,
						passwordHash: true,
						twoFactorEnabled: true,
					},
				});
				if (!user || !user.passwordHash) return null;

				const isValid = await bcrypt.compare(
					credentials.password,
					user.passwordHash,
				);
				if (!isValid) return null;

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					twoFactorEnabled: user.twoFactorEnabled,
					rememberMe: credentials.remember === "true",
				};
			},
		}),
	],

	session: {
		strategy: "jwt",
		maxAge: REMEMBERED_MAX_AGE, // 14 days
		updateAge: 24 * 60 * 60, // refresh every 24h
	},

	cookies: {
		sessionToken: {
			name:
				process.env.NODE_ENV === "production"
					? "__Secure-next-auth.session-token"
					: "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},

	secret: process.env.NEXTAUTH_SECRET,

	pages: {
		signIn: "/",
	},

	callbacks: {
		async signIn({ account, profile }) {
			// For Google OAuth, require the provider to have verified the email
			// to prevent account linking with unverified email addresses.
			// GitHub only returns the user's primary verified email by default,
			// so no additional check is needed for it.
			if (account?.provider === "google") {
				return (
					(profile as { email_verified?: boolean })?.email_verified === true
				);
			}
			return true;
		},

		async redirect({ url, baseUrl }) {
			try {
				const target = new URL(url, baseUrl);
				if (target.origin === baseUrl) return target.toString();
			} catch {}
			return `${baseUrl}/dashboard`;
		},

		async jwt({ token, user, trigger }) {
			if (user) {
				token.id = user.id;
				// Generate a unique JWT ID for device session tracking
				token.jti = crypto.randomUUID();

				// Set custom session expiry based on "remember me" preference.
				// OAuth sign-ins have undefined rememberMe, defaulting to remembered.
				const rememberMe = user.rememberMe !== false;
				const maxAge = rememberMe ? REMEMBERED_MAX_AGE : SHORT_MAX_AGE;
				token.expiresAt = Date.now() + maxAge * 1000;

				// Pre-register device session so API calls succeed immediately
				// on the first page load (avoids race with DeviceSessionProvider).
				// DeviceSessionProvider will upsert with device info later.
				await prisma.deviceSession
					.create({
						data: {
							userId: user.id,
							jti: token.jti,
							lastActiveAt: new Date(),
						},
					})
					.catch(() => {});

				// Check if 2FA is required (works for both credentials and OAuth)
				const dbUser = await prisma.user.findUnique({
					where: { id: user.id },
					select: { twoFactorEnabled: true },
				});
				if (
					dbUser?.twoFactorEnabled &&
					process.env.NODE_ENV !== "development"
				) {
					token.pendingTwoFactor = true;
				}
			}

			// Enforce custom session expiry (short "non-remembered" sessions)
			if (token.expiresAt && Date.now() >= token.expiresAt) {
				if (token.jti) {
					await prisma.deviceSession
						.delete({ where: { jti: token.jti as string } })
						.catch(() => {});
				}
				return {} as typeof token;
			}

			// Handle session.update() trigger for 2FA verification
			if (trigger === "update" && token.id && token.pendingTwoFactor) {
				const dbUser = await prisma.user.findUnique({
					where: { id: token.id as string },
					select: { twoFactorVerifiedAt: true },
				});
				if (
					dbUser?.twoFactorVerifiedAt &&
					Date.now() - dbUser.twoFactorVerifiedAt.getTime() < 5 * 60 * 1000
				) {
					delete token.pendingTwoFactor;
					await prisma.user.update({
						where: { id: token.id as string },
						data: { twoFactorVerifiedAt: null },
					});
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id;
			}
			if (token.jti) {
				session.jti = token.jti;
			}
			if (token.pendingTwoFactor) {
				session.pendingTwoFactor = true;
			}
			if (token.expiresAt) {
				session.expiresAt = token.expiresAt;
			}
			session.remember =
				!token.expiresAt || token.expiresAt - Date.now() > SHORT_MAX_AGE * 1000;
			return session;
		},
	},

	events: {
		async signOut({ token }) {
			// Clean up the device session when the user signs out
			if (token?.jti) {
				await prisma.deviceSession
					.delete({ where: { jti: token.jti as string } })
					.catch(() => {});
			}
		},
	},
};
