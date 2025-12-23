"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import CardV2 from "@pointwise/app/components/ui/CardV2";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { hasWriteAccess } from "@pointwise/lib/api/projectsV2";
import { useGetProjectQuery } from "@pointwise/lib/redux/services/projectsApi";
import { useGetTasksQuery } from "@pointwise/lib/redux/services/tasksApi";
import { useParams } from "next/navigation";
import CreateTaskModal from "../modals/task/CreateTaskModal";
import TaskCardV2 from "../taskCard/TaskCardV2";
import NoTasksView from "./NoTasksView";

export default function TasksOverview() {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useGetProjectQuery(projectId);
  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
    refetch: refetchTasks,
  } = useGetTasksQuery({ projectId });

  const project = projectData?.project;
  const hasTasks =
    !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length > 0;
  const isEmpty =
    !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length === 0;
  const isLoading = isProjectLoading || isTasksLoading;
  const isError = isProjectError || isTasksError;

  return (
    <>
      <CreateTaskModal projectId={projectId} />
      <Container direction="vertical" gap="sm" className="py-2">
        <CardV2
          title="Tasks"
          label="Overview"
          loading={isLoading}
          action={
            hasWriteAccess(project?.role ?? "NONE") ? (
              <Button
                variant="secondary"
                onClick={() =>
                  ModalV2.Manager.open(`create-task-modal-${projectId}`)
                }
              >
                Create Task
              </Button>
            ) : null
          }
        >
          <Container
            direction="vertical"
            gap="sm"
            width="full"
            className="pt-2"
          >
            <ErrorCard
              display={isError}
              message={
                isProjectError
                  ? "Project could not be loaded"
                  : "Tasks could not be loaded"
              }
              onRetry={isProjectError ? refetchProject : refetchTasks}
              className="mb-6"
            />
            {hasTasks && project ? (
              tasks.tasks.map((task) => (
                <TaskCardV2 key={task.id} task={task} project={project} />
              ))
            ) : isEmpty ? (
              <NoTasksView
                hasWriteAccess={hasWriteAccess(project?.role ?? "NONE")}
                onCreateClick={() =>
                  ModalV2.Manager.open(`create-task-modal-${projectId}`)
                }
              />
            ) : null}
          </Container>
        </CardV2>
      </Container>
    </>
  );
}
