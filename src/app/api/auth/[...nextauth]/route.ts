export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { authOptions } from "@pointwise/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
