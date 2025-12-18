"use client";

import clsx from "clsx";
import Image from "next/image";

interface BrandHeaderV2Props {
	className?: string;
	size?: "sm" | "default";
}

const sizeClasses = {
	sm: {
		container: "h-8 w-8 sm:h-10 sm:w-10",
		image: 40,
		text: "tracking-[0.3em] text-xs font-semibold text-zinc-500 uppercase",
	},
	default: {
		container: "h-12 w-12 sm:h-14 sm:w-14",
		image: 56,
		text: "text-xl font-bold text-zinc-100",
	},
} as const;

export default function BrandHeaderV2({ className, size = "default" }: BrandHeaderV2Props) {
	const { container, image, text } = sizeClasses[size];

	return (
		<>
			<div className={clsx("relative shrink-0", container, className)}>
				<Image
					src="/logo.png"
					alt="Pointwise"
					width={image}
					height={image}
					className="object-contain"
					priority
				/>
			</div>
			<span className={clsx("sm:block hidden", text)}>Pointwise</span>
		</>
	);
}
