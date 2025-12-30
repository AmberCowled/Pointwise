"use client";

import Container from "@pointwise/app/components/ui/Container";

export interface ProjectCardHeaderProps {
  /**
   * Project name to display
   */
  name: string;
}

/**
 * ProjectCardHeader - Displays the project name/title
 *
 * Shows the project name centered with hover effects.
 */
export default function ProjectCardHeader({ name }: ProjectCardHeaderProps) {
  return (
    <Container width="auto">
      <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors w-full text-center min-w-0 truncate">
        {name}
      </h2>
    </Container>
  );
}
