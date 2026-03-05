"use client";

import Container from "@pointwise/app/components/ui/Container";
import { StyleTheme } from "@pointwise/app/components/ui/StyleTheme";
import { IoFolder } from "react-icons/io5";

export default function NoProjectsView() {
	return (
		<Container direction="vertical" gap="sm" className="items-center py-12">
			<IoFolder
				className={`h-10 w-10 ${StyleTheme.Text.Muted}`}
				aria-hidden="true"
			/>
			<p className={`text-sm ${StyleTheme.Text.Secondary}`}>
				No projects found
			</p>
			<p className={`text-xs ${StyleTheme.Text.Muted}`}>
				Create or join a project to see analytics
			</p>
		</Container>
	);
}
