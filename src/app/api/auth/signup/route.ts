import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@pointwise/lib/prisma';

// bcrypt needs Node runtime (not Edge) on Next 16
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name: name ?? null, email, passwordHash },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.log(`User experience sign up exception: ${e}`);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
