"use client";

import type { ProjectVisibility } from "@pointwise/lib/validation/projects-schema";
import { IoGlobe, IoLockClosed } from "react-icons/io5";

export interface ProjectCardVisibilityProps {
	visibility: ProjectVisibility;
}

const visibilityIcons: Record<ProjectVisibility, React.ReactNode> = {
	PUBLIC: <IoGlobe className="size-4.5 text-sky-300" />,
	PRIVATE: <IoLockClosed className="size-4.5 text-zinc-500" />,
};

export default function ProjectCardVisibility({
	visibility,
}: ProjectCardVisibilityProps) {
	return visibilityIcons[visibility];
}
