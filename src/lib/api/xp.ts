import prisma from "@pointwise/lib/prisma";
import {
  type UpdateXPRequest,
  type XP,
  XP_SCHEMA,
} from "@pointwise/lib/validation/xp-schema";
import { ApiError } from "./errors";

type XpCurve = { BASE: number; GROWTH: number; version: string };

const MAX_LEVEL = 100;
const XP_CURVE: XpCurve = { BASE: 100, GROWTH: 1.5, version: "v1" };

function xpToNext(level: number, curve = XP_CURVE): number {
  const L = Math.max(1, Math.floor(level));
  return Math.floor(curve.BASE * L ** curve.GROWTH);
}

const STARTS: number[] = (() => {
  const arr = new Array(MAX_LEVEL + 2).fill(0);
  let cum = 0;
  arr[1] = 0;
  for (let L = 1; L <= MAX_LEVEL; L++) {
    cum += xpToNext(L);
    arr[L + 1] = cum;
  }
  return arr;
})();

function calculateLevelFromXp(totalXp: number) {
  const xp = Math.max(0, Math.floor(totalXp));

  let lo = 1,
    hi = MAX_LEVEL + 1,
    level = 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (STARTS[mid] <= xp) {
      level = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (level > MAX_LEVEL) level = MAX_LEVEL;

  const start = STARTS[level];
  const nextStart =
    level < MAX_LEVEL ? STARTS[level + 1] : STARTS[MAX_LEVEL + 1];
  const xpIntoLevel = Math.max(0, xp - start);
  const xpToNext = Math.max(0, nextStart - start);
  const progress =
    level < MAX_LEVEL && xpToNext > 0 ? xpIntoLevel / xpToNext : 1;

  return { level, progress, xpIntoLevel, xpToNext, start, nextStart };
}

/**
 * Get XP data for a user by ID
 *
 * @param userId - User ID to fetch XP for
 * @returns XP data with level, progress, and related values
 */
export async function getXP(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  const xp = user?.xp ?? 0;
  return xp;
}

/**
 * Update XP for a user by ID
 *
 * @param userId - User ID to update XP for
 * @param UpdateXPRequest - Request containing either value or delta
 * @returns Updated XP data
 */
export async function updateXP(
  userId: string,
  request: UpdateXPRequest,
): Promise<number> {
  const prismaUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { xp: true },
  });

  let newXP = prismaUser.xp;
  if (request.value !== undefined) {
    newXP = request.value;
  } else if (request.delta !== undefined) {
    newXP = prismaUser.xp + request.delta;
  }

  if (newXP === prismaUser.xp) {
    throw new ApiError("No XP change", 400);
  }

  const updatedPrismaUser = await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP },
    select: { xp: true },
  });

  return updatedPrismaUser.xp;
}

/**
 * Serialize raw XP value into XP data structure
 *
 * @param xp - Raw XP value from database
 * @returns XP data with level, progress, and related values
 */
export function serializeXP(xp: number): XP {
  const result = calculateLevelFromXp(xp);

  return XP_SCHEMA.parse({
    value: xp,
    lv: result.level,
    toNextLv: result.xpToNext - result.xpIntoLevel, // XP remaining to next level
    nextLvAt: result.nextStart, // Total XP at which next level is reached
    lvStartXP: result.start, // Total XP at which current level started
    progress: Math.round(result.progress * 100), // Convert 0-1 to 0-100 and round to integer
  });
}
