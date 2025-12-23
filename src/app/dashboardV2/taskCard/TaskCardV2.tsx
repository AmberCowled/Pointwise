"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import { TextPreview } from "@pointwise/app/components/ui/TextPreview";
import type { TaskV2 } from "@pointwise/lib/validation/tasks-schema";
import TaskCardV2Category from "./TaskCardV2Category";
import TaskCardV2Date from "./TaskCardV2Date";
import TaskCardV2Optional from "./TaskCardV2Optional";
import TaskCardV2Status from "./TaskCardV2Status";
import TaskCardV2XP from "./TaskCardV2XP";

export default function TaskCardV2({ task }: { task: TaskV2 }) {
  return (
    <Container
      direction="vertical"
      gap="sm"
      width="full"
      className="bg-black/50 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-pointer p-4"
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
            hasTime={task.hasStartTime}
          />
          <TaskCardV2Date
            label="Due"
            date={task.dueDate ?? ""}
            hasTime={task.hasDueTime}
          />
        </Container>
        <Container width="auto" className="justify-end">
          {task.status === "PENDING" ? (
            <Button size="xs" className="min-w-25 hover:cursor-pointer">
              Complete
            </Button>
          ) : null}
        </Container>
      </Container>
    </Container>
  );
}
