import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@pointwise/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import type { SessionStrategy } from 'next-auth';

const sessionStrategy: SessionStrategy = 'jwt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(
          credentials!.password,
          user.passwordHash,
        );
        return isValid ? user : null;
      },
    }),
  ],
  session: { strategy: sessionStrategy },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth',
  },
};
