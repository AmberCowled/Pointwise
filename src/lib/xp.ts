export type XpCurve = { BASE: number; GROWTH: number; version: string };

export const MAX_LEVEL = 100;
export const XP_CURVE: XpCurve = { BASE: 100, GROWTH: 1.5, version: 'v1' };

export function xpToNext(level: number, curve = XP_CURVE): number {
  const L = Math.max(1, Math.floor(level));
  return Math.floor(curve.BASE * Math.pow(L, curve.GROWTH));
}

export const STARTS: number[] = (() => {
  const arr = new Array(MAX_LEVEL + 2).fill(0);
  let cum = 0;
  arr[1] = 0;
  for (let L = 1; L <= MAX_LEVEL; L++) {
    cum += xpToNext(L);
    arr[L + 1] = cum;
  }
  return arr;
})();

export function cumulativeXpForLevel(level: number): number {
  const L = Math.min(Math.max(1, Math.floor(level)), MAX_LEVEL + 1);
  return STARTS[L];
}

export function levelFromXp(totalXp: number) {
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

  return { level, progress, xpIntoLevel, xpToNext };
}
