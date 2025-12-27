"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import CardV2 from "@pointwise/app/components/ui/CardV2";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import {
  isDateAfter,
  isDateBefore,
  isDateBetween,
  localDayEnd,
  localDayStart,
  utcToLocal,
} from "@pointwise/lib/api/date-time";
import { hasWriteAccess } from "@pointwise/lib/api/projectsV2";
import { useGetProjectQuery } from "@pointwise/lib/redux/services/projectsApi";
import { useGetTasksQuery } from "@pointwise/lib/redux/services/tasksApi";
import type { TaskV2 } from "@pointwise/lib/validation/tasks-schema";
import { useParams } from "next/navigation";
import { useState } from "react";
import CreateTaskModal from "../modals/task/CreateTaskModal";
import TaskCardV2 from "../taskCard/TaskCardV2";
import NoFilteredTasksView from "./NoFilteredTasksView";
import NoTasksView from "./NoTasksView";
import TaskFilters, { type TaskFiltersRequest } from "./TaskFilters";

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

  const [filteredTasks, setFilteredTasks] = useState<TaskV2[]>([]);

  const project = projectData?.project;
  const hasTasks =
    !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length > 0;
  const isEmpty =
    !isTasksLoading && !isTasksError && tasks && tasks?.tasks.length === 0;
  const isLoading = isProjectLoading || isTasksLoading;
  const isError = isProjectError || isTasksError;

  const filterByStatus = (task: TaskV2, filters: TaskFiltersRequest) => {
    return (
      filters.status === "All" || task.status === filters.status.toUpperCase()
    );
  };

  const filterByDate = (task: TaskV2, filters: TaskFiltersRequest) => {
    if (filters.date === "All") {
      return true;
    }

    const dayStart = localDayStart();
    const dayEnd = localDayEnd();
    const localTaskStartDate = utcToLocal(task.startDate ?? "")?.date;
    const localTaskDueDate = utcToLocal(task.dueDate ?? "")?.date;

    if (filters.date === "Today") {
      // Task is "today" if:
      // - startDate is today, OR
      // - dueDate is today, OR
      // - task spans today (started before/on today AND due on/after today)
      if (
        localTaskStartDate &&
        isDateBetween(localTaskStartDate, dayStart, dayEnd)
      ) {
        return true;
      }

      if (
        localTaskDueDate &&
        isDateBetween(localTaskDueDate, dayStart, dayEnd)
      ) {
        return true;
      }

      // Task spans today (started before today but due today or later)
      if (
        localTaskStartDate &&
        isDateBefore(localTaskStartDate, dayStart) &&
        localTaskDueDate &&
        !isDateBefore(localTaskDueDate, dayStart)
      ) {
        return true;
      }

      return false;
    }

    if (filters.date === "Overdue") {
      // Overdue: dueDate has passed (is before today)
      // Only check tasks that have a dueDate and it's in the past
      if (localTaskDueDate && isDateBefore(localTaskDueDate, dayStart)) {
        return true;
      }

      return false;
    }

    if (filters.date === "Upcoming") {
      // Upcoming: startDate or dueDate is after today
      if (
        (localTaskStartDate && isDateAfter(localTaskStartDate, dayEnd)) ||
        (localTaskDueDate && isDateAfter(localTaskDueDate, dayEnd))
      ) {
        return true;
      }

      return false;
    }

    return false; // Default: don't include if filter doesn't match
  };

  const filterByCategory = (task: TaskV2, filters: TaskFiltersRequest) => {
    return (
      filters.category === "All" ||
      task.category === filters.category ||
      task.category === filters.customCategory
    );
  };

  const filterByOptional = (task: TaskV2, filters: TaskFiltersRequest) => {
    return !task.optional || filters.optional;
  };

  const handleFiltersChange = (filters: TaskFiltersRequest) => {
    const filteredTasks = tasks?.tasks.filter(
      (task) =>
        filterByStatus(task, filters) &&
        filterByDate(task, filters) &&
        filterByCategory(task, filters) &&
        filterByOptional(task, filters),
    );
    setFilteredTasks(filteredTasks || []);
  };

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
            <TaskFilters onChange={handleFiltersChange} />
            <ErrorCard
              display={isError}
              message={
                isProjectError
                  ? "Project could not be loaded"
                  : "Tasks could not be loaded"
              }
              onRetry={isProjectError ? refetchProject : refetchTasks}
              className="mb-6 w-full"
            />
            {hasTasks && project ? (
              filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCardV2 key={task.id} task={task} project={project} />
                ))
              ) : (
                <NoFilteredTasksView />
              )
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
