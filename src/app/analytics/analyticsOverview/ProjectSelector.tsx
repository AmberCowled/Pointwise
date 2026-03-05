"use client";

import Container from "@pointwise/app/components/ui/Container";
import InputSelect from "@pointwise/app/components/ui/InputSelect";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import type { Project } from "@pointwise/lib/validation/projects-schema";

interface ProjectSelectorProps {
	projects: Project[];
	onSelect: (projectId: string) => void;
	selectedProjectId: string | null;
}

export default function ProjectSelector({
	projects,
	onSelect,
	selectedProjectId,
}: ProjectSelectorProps) {
	const options = projects.map((p) => `${p.name}`);
	const selectedIndex = projects.findIndex((p) => p.id === selectedProjectId);
	const selectedOption =
		selectedIndex >= 0 ? options[selectedIndex] : undefined;

	return (
		<Container gap="sm" width="full" className="items-end">
			<InputSelect
				variant="secondary"
				label="Project"
				size="sm"
				flex="grow"
				defaultValue={selectedOption}
				options={options}
				onSelect={(value) => {
					const project = projects.find((p) => `${p.name}` === value);
					if (project) onSelect(project.id);
				}}
				className={`max-h-10 ${StyleTheme.Container.BackgroundSubtle} ${StyleTheme.Text.Secondary} hover:text-zinc-100`}
			/>
		</Container>
	);
}
