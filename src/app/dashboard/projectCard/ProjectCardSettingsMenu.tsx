"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Menu from "@pointwise/app/components/ui/menu";
import Modal from "@pointwise/app/components/ui/modal";
import { useUserId } from "@pointwise/hooks/useUserId";
import { useRouter } from "next/navigation";
import { IoSettings } from "react-icons/io5";

export interface ProjectCardSettingsMenuProps {
  role: "ADMIN" | "USER" | "VIEWER" | "NONE";
  projectId: string;
  joinRequestUserIds?: string[];
}

export default function ProjectCardSettingsMenu({
  role,
  projectId,
  joinRequestUserIds = [],
}: ProjectCardSettingsMenuProps) {
  const userId = useUserId();
  const router = useRouter();

  const handleCancelRequest = () => {
    console.log("cancel request");
    // TODO: Implement cancel request API call
  };

  const handleRequestJoin = () => {
    console.log("request join");
    // TODO: Implement request join API call
  };

  const handleViewProject = () => {
    router.push(`/dashboard/${projectId}`);
  };

  const handleEditProject = () => {
    Modal.Manager.open(`update-project-modal-${projectId}`);
  };

  const handleLeave = () => {
    console.log("leave project");
    // TODO: Implement leave project API call
  };

  const handleDelete = () => {
    console.log("delete project");
    // TODO: Implement delete project API call
  };

  return (
    <Menu trigger={<Button variant="ghost" size="xs" icon={IoSettings} />}>
      {role === "NONE" && (
        <Menu.Section>
          {userId && joinRequestUserIds?.includes(userId) ? (
            <Menu.Option label="Cancel Request" onClick={handleCancelRequest} />
          ) : (
            <Menu.Option label="Request to Join" onClick={handleRequestJoin} />
          )}
          <Menu.Option label="View Project" onClick={handleViewProject} />
        </Menu.Section>
      )}

      {role === "ADMIN" && (
        <>
          <Menu.Section>
            <Menu.Option
              label="View Project"
              href={`/dashboard/${projectId}`}
            />
            <Menu.Option label="Edit Project" onClick={handleEditProject} />
          </Menu.Section>
          <Menu.Section>
            <Menu.Option label="Leave Project" onClick={handleLeave} />
            <Menu.Option label="Delete Project" danger onClick={handleDelete} />
          </Menu.Section>
        </>
      )}

      {(role === "USER" || role === "VIEWER") && (
        <Menu.Section>
          <Menu.Option label="View Project" href={`/dashboard/${projectId}`} />
          <Menu.Option label="Leave Project" onClick={handleLeave} />
        </Menu.Section>
      )}
    </Menu>
  );
}
