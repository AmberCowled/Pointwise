"use client";

import Container from "@pointwise/app/components/ui/Container";
import { IoClipboard, IoPeople } from "react-icons/io5";

export interface ProjectCardV2StatsProps {
  /**
   * Number of tasks in the project
   */
  taskCount: number;
  /**
   * Number of members in the project
   */
  memberCount: number;
}

/**
 * ProjectCardV2Stats - Displays task count and member count
 *
 * Shows statistics about the project including number of tasks and members.
 */
export default function ProjectCardV2Stats({
  taskCount,
  memberCount,
}: ProjectCardV2StatsProps) {
  return (
    <Container fullWidth={false} className="gap-4">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <IoClipboard className="w-4 h-4" aria-hidden="true" />
        <span>
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <IoPeople className="w-4 h-4" aria-hidden="true" />
        <span>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
      </div>
    </Container>
  );
}
