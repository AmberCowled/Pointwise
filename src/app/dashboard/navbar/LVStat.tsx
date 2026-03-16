"use client";

import { Stat } from "@pointwise/app/components/ui/Stat";
import { useGetXPQuery } from "@pointwise/generated/api";
import { IoStar } from "react-icons/io5";

export default function LVStat() {
	const { data: xp, isLoading, isFetching, isError } = useGetXPQuery();

	const level = xp?.xp.lv ?? 0;
	const isCurrentlyLoading = isLoading || (isFetching && !xp);

	return (
		<Stat
			icon={IoStar}
			label="Level"
			value={level}
			colorClass="text-indigo-400"
			isLoading={isCurrentlyLoading}
			isError={isError}
		/>
	);
}
