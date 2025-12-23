import { Button } from "@pointwise/app/components/ui/Button";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import {
  datesEqual,
  localToUTC,
  timesEqual,
  utcToLocal,
} from "@pointwise/lib/api/date-time";
import { hasDeleteAccess } from "@pointwise/lib/api/projectsV2";
import {
  CORE_TASK_CATEGORIES,
  CUSTOM_CATEGORY_LABEL,
  isCoreTaskCategory,
} from "@pointwise/lib/categories";
import { useUpdateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import type { Project } from "@pointwise/lib/validation/projects-schema";
import type { TaskV2 } from "@pointwise/lib/validation/tasks-schema";
import { useCallback, useEffect, useState } from "react";
import DeleteTaskModal from "./DeleteTaskModal";
import TaskForm from "./TaskForm";

export interface UpdateTaskModalProps {
  task: TaskV2;
  project: Project;
}

export default function UpdateTaskModal({
  task,
  project,
}: UpdateTaskModalProps) {
  const localStartDate = utcToLocal(task?.startDate ?? "");
  const localDueDate = utcToLocal(task?.dueDate ?? "");

  // Initialize state from task data
  const [title, setTitle] = useState<string>(task?.title ?? "");
  const [description, setDescription] = useState<string>(
    task?.description ?? "",
  );
  const taskCategory = task?.category ?? "";
  const isTaskCustomCategory =
    taskCategory && !isCoreTaskCategory(taskCategory);
  const [category, setCategory] = useState<string>(
    isTaskCustomCategory
      ? CUSTOM_CATEGORY_LABEL
      : taskCategory || CORE_TASK_CATEGORIES[0],
  );
  const [customCategory, setCustomCategory] = useState<string>(
    isTaskCustomCategory ? taskCategory : "",
  );
  const [xpAward, setXpAward] = useState<number>(task?.xpAward ?? 50);
  const [startDate, setStartDate] = useState<Date | null>(
    localStartDate?.date ?? null,
  );
  const [startTime, setStartTime] = useState<string | null>(
    task?.hasStartTime ? (localStartDate?.time ?? null) : null,
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    localDueDate?.date ?? null,
  );
  const [dueTime, setDueTime] = useState<string | null>(
    task?.hasDueTime ? (localDueDate?.time ?? null) : null,
  );
  const [optional, setOptional] = useState<boolean>(task?.optional ?? false);

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  // Reset state from task data - reusable function
  const resetStateFromTask = useCallback(() => {
    const localStartDate = utcToLocal(task?.startDate ?? "");
    const localDueDate = utcToLocal(task?.dueDate ?? "");
    const taskCategory = task?.category ?? "";
    const isTaskCustomCategory =
      taskCategory && !isCoreTaskCategory(taskCategory);

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setCategory(
      isTaskCustomCategory
        ? CUSTOM_CATEGORY_LABEL
        : taskCategory || CORE_TASK_CATEGORIES[0],
    );
    setCustomCategory(isTaskCustomCategory ? taskCategory : "");
    setXpAward(task?.xpAward ?? 50);
    setStartDate(localStartDate?.date ?? null);
    setStartTime(task?.hasStartTime ? (localStartDate?.time ?? null) : null);
    setDueDate(localDueDate?.date ?? null);
    setDueTime(task?.hasDueTime ? (localDueDate?.time ?? null) : null);
    setOptional(task?.optional ?? false);
  }, [
    task?.title,
    task?.description,
    task?.category,
    task?.xpAward,
    task?.optional,
    task?.startDate,
    task?.dueDate,
    task?.hasStartTime,
    task?.hasDueTime,
  ]);

  // Sync state when task changes (similar to UpdateProjectModal)
  useEffect(() => {
    resetStateFromTask();
  }, [resetStateFromTask]);

  const handleUpdateTask = async () => {
    const finalCategory =
      category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
    const startDateUtc =
      startDate !== null ? localToUTC(startDate, startTime) : null;
    const dueDateUtc = dueDate !== null ? localToUTC(dueDate, dueTime) : null;

    try {
      await updateTask({
        taskId: task.id,
        data: {
          projectId: project.id,
          title: title.trim(),
          description: description.trim() || null,
          category: finalCategory,
          xpAward: xpAward,
          startDate: startDateUtc !== null ? startDateUtc?.date : null,
          hasStartTime: startTime !== null,
          dueDate: dueDateUtc !== null ? dueDateUtc?.date : null,
          hasDueTime: dueTime !== null,
          optional: optional,
        },
      }).unwrap();
      ModalV2.Manager.close(`update-task-modal-${task.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const canSubmit = () => {
    if (title.trim() === "") return false;
    if (category === CUSTOM_CATEGORY_LABEL && customCategory.trim() === "") {
      return false;
    }

    // Calculate final category values for comparison
    const finalCategory =
      category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
    const taskFinalCategory = task.category ?? "";

    // Check if dates changed
    const startDateChanged = !datesEqual(localStartDate?.date, startDate);
    const dueDateChanged = !datesEqual(localDueDate?.date, dueDate);

    // Check if times changed
    const startTimeChanged = !timesEqual(localStartDate?.time, startTime);
    const dueTimeChanged = !timesEqual(localDueDate?.time, dueTime);

    // Check if date/time combination changed
    const startDateTimeChanged = startDateChanged || startTimeChanged;
    const dueDateTimeChanged = dueDateChanged || dueTimeChanged;

    // Compare all fields
    if (
      title !== (task.title ?? "") ||
      description !== (task.description ?? "") ||
      finalCategory !== taskFinalCategory ||
      xpAward !== (task.xpAward ?? 50) ||
      optional !== (task.optional ?? false) ||
      startDateTimeChanged ||
      dueDateTimeChanged
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <DeleteTaskModal task={task} />
      <ModalV2
        id={`update-task-modal-${task.id}`}
        size="2xl"
        loading={isLoading}
        onOpen={resetStateFromTask}
      >
        <ModalV2.Header title="Update Task" />
        <ModalV2.Body>
          <TaskForm
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            category={category}
            onCategoryChange={setCategory}
            customCategory={customCategory}
            onCustomCategoryChange={setCustomCategory}
            xpAward={xpAward}
            onXpAwardChange={setXpAward}
            startDate={startDate}
            onStartDateChange={setStartDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            dueTime={dueTime}
            onDueTimeChange={setDueTime}
            optional={optional}
            onOptionalChange={setOptional}
          />
        </ModalV2.Body>
        <ModalV2.Footer align="end">
          <Button variant="secondary">Cancel</Button>
          {hasDeleteAccess(project.role) && (
            <Button
              variant="danger"
              onClick={() =>
                ModalV2.Manager.open(`delete-task-modal-${task.id}`)
              }
            >
              Delete
            </Button>
          )}
          <Button disabled={!canSubmit()} onClick={handleUpdateTask}>
            Update
          </Button>
        </ModalV2.Footer>
      </ModalV2>
    </>
  );
}
