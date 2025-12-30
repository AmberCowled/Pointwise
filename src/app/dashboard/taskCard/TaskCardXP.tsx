"use client";

export default function TaskCardXP({ xp }: { xp: number }) {
  return (
    <span className="text-xs border border-blue-500 rounded-xl px-2 py-0.5 bg-blue-900/40 text-blue-300 w-25 text-center">
      +{xp} XP
    </span>
  );
}
