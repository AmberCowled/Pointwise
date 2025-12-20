"use client";

import Container from "@pointwise/app/components/ui/Container";

export interface ProjectCardV2HeaderProps {
	/**
	 * Project name to display
	 */
	name: string;
}

/**
 * ProjectCardV2Header - Displays the project name/title
 *
 * Shows the project name centered with hover effects.
 */
export default function ProjectCardV2Header({ name }: ProjectCardV2HeaderProps) {
	return (
		<Container fullWidth={false} className="items-center">
			<h2 className="text-lg font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors w-full text-center min-w-0 truncate">
				{name}
			</h2>
		</Container>
	);
}
