"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { IoFolder } from "react-icons/io5";

export interface NoProjectsViewProps {
  /**
   * Callback when "Create Your First Project" button is clicked
   */
  onCreateClick?: () => void;
}

/**
 * NoProjectsView - Empty state component when user has no projects
 *
 * Displays a friendly message encouraging users to create their first project.
 */
export default function NoProjectsView({ onCreateClick }: NoProjectsViewProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
        <IoFolder className="w-8 h-8 text-zinc-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">
        No projects yet
      </h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
        Create your first project to start organizing your tasks and
        collaborating with your team.
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={onCreateClick}
      >
        Create Your First Project
      </Button>
    </div>
  );
}
