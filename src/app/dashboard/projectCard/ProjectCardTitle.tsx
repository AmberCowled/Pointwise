"use client";

import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import { IoFolder } from "react-icons/io5";

export interface ProjectCardTitleProps {
	title: string;
}

export default function ProjectCardTitle({ title }: ProjectCardTitleProps) {
	return (
		<>
			<IoFolder className="size-5 text-[#FFD966]" />
			<TextPreview
				text={title}
				lines={1}
				size="md"
				className="font-bold text-zinc-200 text-lg"
			/>
		</>
	);
}
