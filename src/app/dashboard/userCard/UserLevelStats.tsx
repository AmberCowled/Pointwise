import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { serializeXP } from "@pointwise/lib/api/xp";
import { IoStar } from "react-icons/io5";

interface UserLevelStatsProps {
	xp: number;
}

export default function UserLevelStats({ xp }: UserLevelStatsProps) {
	const xpData = serializeXP(xp);
	const lv = xpData.lv;
	const xpIntoLevel = xpData.value - xpData.lvStartXP;
	const nextLvAt = xpData.nextLvAt - xpData.lvStartXP;
	const progress = xpData.progress;

	return (
		<>
			<IoStar className="size-3" />
			<span className="text-xs font-light pr-1">{lv}</span>
			<span className="text-xs text-zinc-300/80 font-light">
				{xpIntoLevel} / {nextLvAt} XP
			</span>
			<div className="flex-1 h-1 bg-zinc-700/50 rounded-full mx-1">
				<div
					className={`h-full rounded-full bg-linear-to-r ${StyleTheme.GalaxyGradientStops}`}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</>
	);
}
