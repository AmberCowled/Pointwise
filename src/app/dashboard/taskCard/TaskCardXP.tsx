"use client";

export default function TaskCardXP({ xp }: { xp: number }) {
	return (
		<span className="text-xs border border-blue-500/50 rounded-xl px-2 py-0.5 bg-blue-500/10 text-blue-400 min-w-25 text-center font-medium uppercase">
			+{xp} XP
		</span>
	);
}
