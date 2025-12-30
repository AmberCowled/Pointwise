"use client";

import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";

export interface ProjectCardDescriptionProps {
  /**
   * Project description text
   */
  description?: string | null;
}

/**
 * ProjectCardDescription - Displays project description with truncation
 *
 * Shows the project description using TextPreview component with line clamping.
 */
export default function ProjectCardDescription({
  description,
}: ProjectCardDescriptionProps) {
  return (
    <Container width="auto">
      <TextPreview
        text={description}
        lines={2}
        placeholder="Edit project to add a description"
        size="sm"
        className="text-zinc-400"
      />
    </Container>
  );
}
