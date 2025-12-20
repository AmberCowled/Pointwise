"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { useGetXPQuery } from "@pointwise/lib/redux/services/xpApi";
import clsx from "clsx";
import { IoRefresh } from "react-icons/io5";

export default function XPBar() {
	const { data: xp, isLoading, isFetching, isError, refetch } = useGetXPQuery();

	const progress = xp?.xp.progress ?? 0;
	const progressPercent = Math.min(100, Math.round(progress));
	const isCurrentlyLoading = isLoading || (isFetching && !xp);

	const progressBarStyles = clsx("h-1.5 w-full rounded-full transition-all", {
		"animate-pulse bg-zinc-700": isCurrentlyLoading,
		"bg-rose-500/10 border border-rose-400/20": isError && !isCurrentlyLoading,
		"bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500": !isError && !isCurrentlyLoading,
	});

	return (
		<Container fullWidth={false} gap="sm" className="w-full items-center">
			<div className="flex-1 relative flex items-center">
				<div className="w-full overflow-hidden rounded-full bg-white/10 h-1.5">
					<div
						className={progressBarStyles}
						style={
							!isCurrentlyLoading && !isError ? { width: `${progressPercent}%` } : { width: "100%" }
						}
					/>
				</div>
			</div>
			{isError && (
				<Button
					variant="danger"
					size="xs"
					icon={IoRefresh}
					onClick={() => refetch()}
					title="Retry loading XP"
					aria-label="Retry loading XP"
				/>
			)}
		</Container>
	);
}
