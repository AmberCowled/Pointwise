import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@pointwise/lib/prisma';
import { authOptions } from '@pointwise/lib/auth';
import { DateTimeDefaults } from '@pointwise/lib/datetime';

type PreferencesPayload = {
  locale?: unknown;
  timeZone?: unknown;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: PreferencesPayload;
  try {
    json = (await request.json()) as PreferencesPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 },
    );
  }

  const rawLocale =
    typeof json.locale === 'string' ? json.locale.trim() : undefined;
  const rawTimeZone =
    typeof json.timeZone === 'string' ? json.timeZone.trim() : undefined;

  if (!rawLocale || !rawTimeZone) {
    return NextResponse.json(
      { error: 'Both locale and timeZone are required' },
      { status: 400 },
    );
  }

  const locale = rawLocale.slice(0, 32);
  const timeZone = rawTimeZone.slice(0, 64);

  await prisma.user.update({
    where: { email },
    data: {
      preferredLocale: locale,
      preferredTimeZone: timeZone,
    },
  });

  const payload = {
    locale: locale || DateTimeDefaults.locale,
    timeZone: timeZone || DateTimeDefaults.timeZone,
  };

  const response = NextResponse.json(payload);
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set('pw-locale', locale, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
    secure,
  });

  response.cookies.set('pw-timezone', timeZone, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
    secure,
  });

  return response;
}
