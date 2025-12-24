"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import { utcNow } from "@pointwise/lib/api/date-time";
import { hasWriteAccess } from "@pointwise/lib/api/projectsV2";
import { useUpdateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useUpdateXPMutation } from "@pointwise/lib/redux/services/xpApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { TaskV2 } from "@pointwise/lib/validation/tasks-schema";
import UpdateTaskModal from "../modals/task/UpdateTaskModal";
import TaskCardV2Category from "./TaskCardV2Category";
import TaskCardV2Date from "./TaskCardV2Date";
import TaskCardV2Optional from "./TaskCardV2Optional";
import TaskCardV2Status from "./TaskCardV2Status";
import TaskCardV2XP from "./TaskCardV2XP";

export default function TaskCardV2({
  task,
  project,
}: {
  task: TaskV2;
  project: Project;
}) {
  const [updateTask, { isLoading: isCompletingTask }] = useUpdateTaskMutation();
  const [updateXP] = useUpdateXPMutation();

  const handleCompleteTask = async () => {
    try {
      const response = await updateTask({
        taskId: task.id,
        data: {
          projectId: project.id,
          completedAt: utcNow(),
          status: "COMPLETED",
        },
      }).unwrap();
      if (response.task) {
        await handleRewardXp(response.task.xpAward);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRewardXp = async (xpAward: number) => {
    try {
      await updateXP({ delta: xpAward }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <UpdateTaskModal task={task} project={project} />
      <Container
        direction="vertical"
        gap="sm"
        width="full"
        className="bg-black/50 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-pointer p-4"
        onClick={() => {
          if (hasWriteAccess(project.role) && task.status !== "COMPLETED") {
            ModalV2.Manager.open(`update-task-modal-${task.id}`);
          }
        }}
      >
        <Container width="full">
          <Container gap="sm" width="full">
            <TextPreview
              text={task.title}
              lines={2}
              placeholder="No title"
              size="md"
              className="text-md font-bold"
            />
            <TaskCardV2Category category={task.category} />
          </Container>
          <Container width="auto" className="justify-end">
            <TaskCardV2XP xp={task.xpAward} />
          </Container>
        </Container>

        <Container width="full">
          <Container width="full">
            <TextPreview
              text={task.description}
              lines={3}
              placeholder="No description"
              size="sm"
              className="text-zinc-400"
            />
          </Container>
          <Container width="auto" className="justify-end">
            <Container width="full" direction="vertical" gap="xs">
              <TaskCardV2Status status={task.status ?? "PENDING"} />
              <TaskCardV2Optional optional={task.optional} />
            </Container>
          </Container>
        </Container>

        <Container width="full">
          <Container
            direction="vertical"
            width="full"
            gap="xs"
            className="items-start"
          >
            <TaskCardV2Date
              label="Start"
              date={task.startDate ?? ""}
              hasTime={task.hasStartTime ?? false}
            />
            <TaskCardV2Date
              label="Due"
              date={task.dueDate ?? ""}
              hasTime={task.hasDueTime ?? false}
            />
          </Container>
          <Container width="auto" className="justify-end">
            {task.status === "PENDING" && hasWriteAccess(project.role) ? (
              <Button
                size="xs"
                className="min-w-25 hover:cursor-pointer"
                loading={isCompletingTask}
                onClick={handleCompleteTask}
              >
                Complete
              </Button>
            ) : null}
          </Container>
        </Container>
      </Container>
    </>
  );
}
