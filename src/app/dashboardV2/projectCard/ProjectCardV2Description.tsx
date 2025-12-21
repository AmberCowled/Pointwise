"use client";

import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";

export interface ProjectCardV2DescriptionProps {
  /**
   * Project description text
   */
  description?: string | null;
}

/**
 * ProjectCardV2Description - Displays project description with truncation
 *
 * Shows the project description using TextPreview component with line clamping.
 */
export default function ProjectCardV2Description({
  description,
}: ProjectCardV2DescriptionProps) {
  return (
    <Container fullWidth={false}>
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
