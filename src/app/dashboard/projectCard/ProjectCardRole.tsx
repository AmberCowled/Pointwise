"use client";

import type { ProjectRole } from "@pointwise/lib/validation/projects-schema";
import clsx from "clsx";

export interface ProjectCardRoleProps {
	role: ProjectRole;
}

type RoleKey = "ADMIN" | "USER" | "VIEWER";

const roleStyles: Record<RoleKey, string> = {
	ADMIN: "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30",
	USER: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
	VIEWER: "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30",
};

const roleLabels: Record<RoleKey, string> = {
	ADMIN: "Admin",
	USER: "Member",
	VIEWER: "Viewer",
};

export default function ProjectCardRole({ role }: ProjectCardRoleProps) {
	if (role === "NONE") {
		return null;
	}

	return (
		<span
			className={clsx(
				"text-xs font-medium px-2 py-0.5 rounded-sm",
				roleStyles[role],
			)}
		>
			{roleLabels[role]}
		</span>
	);
}
