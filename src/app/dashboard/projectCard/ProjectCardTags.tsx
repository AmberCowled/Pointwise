"use client";

import Container from "@pointwise/app/components/ui/Container";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { IoGlobe, IoLockClosed } from "react-icons/io5";
import ProjectCardSettingsMenu from "./ProjectCardSettingsMenu";

export interface ProjectCardTagsProps {
  /**
   * Project ID
   */
  projectId: string;
  /**
   * Project visibility setting
   */
  visibility: "PUBLIC" | "PRIVATE";
  /**
   * User's role in the project
   */
  role: "ADMIN" | "USER" | "VIEWER" | "NONE";
  /**
   * User IDs who have requested to join the project
   **/
  joinRequestUserIds?: string[];
}

/**
 * ProjectCardTags - Displays visibility tag, role tag, and settings button
 *
 * Shows project visibility, user role, and settings menu.
 */
export default function ProjectCardTags({
  projectId,
  visibility,
  role,
  joinRequestUserIds = [],
}: ProjectCardTagsProps) {
  return (
    <Container width="auto" className="gap-2 items-center">
      {visibility === "PUBLIC" ? (
        <Tag variant="info" size="xs" icon={IoGlobe}>
          Public
        </Tag>
      ) : (
        <Tag variant="secondary" size="xs" icon={IoLockClosed}>
          Private
        </Tag>
      )}
      {role !== "NONE" && (
        <Tag
          variant={
            role === "ADMIN"
              ? "primary"
              : role === "USER"
                ? "secondary"
                : "info"
          }
          size="xs"
        >
          {role === "ADMIN" ? "Admin" : role === "USER" ? "Member" : "Viewer"}
        </Tag>
      )}
      <ProjectCardSettingsMenu
        projectId={projectId}
        role={role}
        joinRequestUserIds={joinRequestUserIds}
      />
    </Container>
  );
}
