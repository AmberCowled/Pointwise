"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { Tag } from "@pointwise/app/components/ui/Tag";
import { IoGlobe, IoLockClosed, IoSettings } from "react-icons/io5";

export interface ProjectCardV2TagsProps {
  /**
   * Project visibility setting
   */
  visibility: "PUBLIC" | "PRIVATE";
  /**
   * User's role in the project
   */
  role: "ADMIN" | "USER" | "VIEWER" | "NONE";
  /**
   * Optional callback when settings button is clicked
   */
  onSettingsClick?: (e: React.MouseEvent) => void;
}

/**
 * ProjectCardV2Tags - Displays visibility tag, role tag, and settings button
 *
 * Shows project visibility, user role, and settings button (for admins only).
 */
export default function ProjectCardV2Tags({
  visibility,
  role,
  onSettingsClick,
}: ProjectCardV2TagsProps) {
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSettingsClick) {
      onSettingsClick(e);
    }
  };

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
      {role === "ADMIN" && (
        <Button
          variant="ghost"
          size="xs"
          icon={IoSettings}
          onClick={handleSettingsClick}
          className="ml-auto shrink-0 p-1"
          aria-label="Project settings"
          title="Project settings"
        />
      )}
    </Container>
  );
}
