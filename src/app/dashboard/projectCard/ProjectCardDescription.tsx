"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
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
				className={`${StyleTheme.Text.Tertiary} pt-2 pb-1`}
			/>
		</Container>
	);
}
