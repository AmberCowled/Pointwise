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
				};
			},
		}),
	],

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
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

			if (token.shortSession) {
				token.shortSession = true;
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
			if (token.shortSession) {
				session.remember = false;
			}
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
