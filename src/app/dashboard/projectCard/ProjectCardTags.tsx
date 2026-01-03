"use client";

import Container from "@pointwise/app/components/ui/Container";
import { Tag } from "@pointwise/app/components/ui/Tag";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import { IoGlobe, IoLockClosed } from "react-icons/io5";
import ProjectCardSettingsMenu from "./ProjectCardSettingsMenu";

export interface ProjectCardTagsProps {
  /**
   * Project
   */
  project: Project;
}

/**
 * ProjectCardTags - Displays visibility tag, role tag, and settings button
 *
 * Shows project visibility, user role, and settings menu.
 */
export default function ProjectCardTags({ project }: ProjectCardTagsProps) {
  return (
    <Container width="auto" className="gap-2 items-center">
      {project.visibility === "PUBLIC" ? (
        <Tag variant="info" size="xs" icon={IoGlobe}>
          Public
        </Tag>
      ) : (
        <Tag variant="secondary" size="xs" icon={IoLockClosed}>
          Private
        </Tag>
      )}
      {(project.role === "ADMIN" ||
        project.role === "USER" ||
        project.role === "VIEWER") && (
        <Tag
          variant={
            project.role === "ADMIN"
              ? "primary"
              : project.role === "USER"
                ? "secondary"
                : project.role === "VIEWER"
                  ? "info"
                  : "secondary"
          }
          size="xs"
        >
          {project.role === "ADMIN"
            ? "Admin"
            : project.role === "USER"
              ? "Member"
              : "Viewer"}
        </Tag>
      )}
      <ProjectCardSettingsMenu project={project} />
    </Container>
  );
}
