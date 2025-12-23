"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { localToUTC } from "@pointwise/lib/api/date-time";
import {
  CORE_TASK_CATEGORIES,
  CUSTOM_CATEGORY_LABEL,
} from "@pointwise/lib/categories";
import { useCreateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useState } from "react";
import TaskForm from "./TaskForm";

export interface CreateTaskModalProps {
  projectId: string;
}

export default function CreateTaskModal({ projectId }: CreateTaskModalProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(CORE_TASK_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState<string>("");
  const [xpAward, setXpAward] = useState<number>(50);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [optional, setOptional] = useState<boolean>(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();

  const handleCreateTask = async () => {
    const finalCategory =
      category === CUSTOM_CATEGORY_LABEL ? customCategory.trim() : category;
    const startDateUtc =
      startDate !== null ? localToUTC(startDate, startTime) : null;
    const dueDateUtc = dueDate !== null ? localToUTC(dueDate, dueTime) : null;

    await createTask({
      projectId,
      title: title.trim(),
      description: description.trim() || null,
      category: finalCategory,
      xpAward: xpAward,
      startDate: startDateUtc !== null ? startDateUtc?.date : null,
      hasStartTime: startTime !== null,
      dueDate: dueDateUtc !== null ? dueDateUtc?.date : null,
      hasDueTime: dueTime !== null,
      optional: optional,
    }).unwrap();
    ModalV2.Manager.close(`create-task-modal-${projectId}`);
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory(CORE_TASK_CATEGORIES[0]);
    setCustomCategory("");
    setXpAward(50);
    setStartDate(null);
    setStartTime(null);
    setDueDate(null);
    setDueTime(null);
    setOptional(false);
  };

  const canSubmit = () => {
    if (title.trim() === "") return false;
    if (category === CUSTOM_CATEGORY_LABEL && customCategory.trim() === "") {
      return false;
    }
    return true;
  };

  return (
    <ModalV2
      id={`create-task-modal-${projectId}`}
      size="2xl"
      loading={isLoading}
      onAfterClose={handleReset}
    >
      <ModalV2.Header title="Create Task" />
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
        <Button disabled={!canSubmit()} onClick={handleCreateTask}>
          Create
        </Button>
      </ModalV2.Footer>
    </ModalV2>
  );
}
