import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@pointwise/lib/auth';
import prisma from '@pointwise/lib/prisma';
import { levelFromXp } from '@pointwise/lib/xp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { delta } = await req.json().catch(() => ({}));
  const inc = Number.isFinite(delta) ? Math.max(0, Math.floor(delta)) : 0;
  if (inc <= 0) {
    return NextResponse.json({ error: 'delta must be > 0' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { xp: true },
  });
  const currentXp =
    typeof existing?.xp === 'number' && Number.isFinite(existing.xp)
      ? Math.max(0, existing.xp)
      : 0;
  const newXp = currentXp + inc;

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { xp: newXp },
    select: { xp: true },
  });

  const derived = levelFromXp(user.xp);
  return NextResponse.json({ xp: user.xp, ...derived }, { status: 200 });
}
