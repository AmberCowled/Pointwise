import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';
import { parseXpAwardBody } from '@pointwise/lib/validation/xp';
import {
  handleRoute,
  errorResponse,
  jsonResponse,
} from '@pointwise/lib/api/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized', 401);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = parseXpAwardBody(rawBody);
    if (!parsed.success) {
      return errorResponse(parsed.error, parsed.status);
    }

    const { delta } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true },
    });
    const currentXp =
      typeof existing?.xp === 'number' && Number.isFinite(existing.xp)
        ? Math.max(0, existing.xp)
        : 0;
    const newXp = currentXp + delta;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { xp: newXp },
      select: { xp: true },
    });

    const derived = levelFromXp(user.xp);
    return jsonResponse({ xp: user.xp, ...derived });
  });
}
