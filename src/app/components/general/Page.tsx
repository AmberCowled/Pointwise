import clsx from "clsx";
import type { ReactNode } from "react";
import BackgroundGlow from "./BackgroundGlow";

interface PageProps {
	children: ReactNode;
	className?: string;
}

export default function Page({ children, className }: PageProps) {
	return (
		<div
			className={clsx(
				"min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center relative overflow-hidden",
				className,
			)}
		>
			<BackgroundGlow />
			{children}
		</div>
	);
}
