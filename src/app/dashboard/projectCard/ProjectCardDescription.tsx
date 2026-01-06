"use client";

import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import type { Project } from "@pointwise/lib/validation/projects-schema";

export interface ProjectCardDescriptionProps {
	project: Project;
}

export default function ProjectCardDescription({
	project,
}: ProjectCardDescriptionProps) {
	return (
		<Container width="full">
			<TextPreview
				text={project.description ?? ""}
				placeholder="No description"
				lines={2}
				size="sm"
				className="text-zinc-300 pt-2 pb-1"
			/>
		</Container>
	);
}
