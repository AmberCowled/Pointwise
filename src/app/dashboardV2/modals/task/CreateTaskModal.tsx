"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { Checkbox } from "@pointwise/app/components/ui/Checkbox";
import Container from "@pointwise/app/components/ui/Container";
import DatePicker from "@pointwise/app/components/ui/DatePicker";
import Grid from "@pointwise/app/components/ui/Grid";
import InputAreaV2 from "@pointwise/app/components/ui/InputAreaV2";
import InputSelectV2 from "@pointwise/app/components/ui/InputSelectV2";
import InputV2 from "@pointwise/app/components/ui/InputV2";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import TimePicker from "@pointwise/app/components/ui/TimePicker";
import { localToUTC } from "@pointwise/lib/api/date-time";
import {
  CORE_TASK_CATEGORIES,
  CUSTOM_CATEGORY_LABEL,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from "@pointwise/lib/categories";
import { useCreateTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import { useState } from "react";

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

  const categoryOptions = [...CORE_TASK_CATEGORIES, CUSTOM_CATEGORY_LABEL];

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
        <Container direction="vertical" gap="md" className="items-stretch">
          <InputV2
            label="Task Title"
            required
            flex="grow"
            onChange={setTitle}
          />

          <InputAreaV2
            label="Description"
            rows={3}
            flex="grow"
            showCharCount
            maxLength={200}
            onChange={setDescription}
          />

          <Grid columns={{ default: 1, sm: 2 }} gap="md">
            <Container
              direction="vertical"
              gap="sm"
              className="items-stretch"
              width="full"
            >
              <InputSelectV2
                label="Category"
                flex="grow"
                options={categoryOptions}
                defaultValue={category}
                onSelect={setCategory}
              />
              {category === CUSTOM_CATEGORY_LABEL && (
                <InputV2
                  label="Custom Category"
                  required
                  flex="grow"
                  maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
                  onChange={setCustomCategory}
                />
              )}
            </Container>
            <InputV2
              label="XP Award"
              type="number"
              flex="grow"
              defaultValue={"50"}
              onChange={(value: string) => setXpAward(Number(value))}
            />
          </Grid>

          <Grid columns={{ default: 1, sm: 2 }} gap="md">
            <Container
              direction="vertical"
              gap="sm"
              className="items-stretch"
              width="full"
            >
              <DatePicker
                label="Start Date"
                flex="grow"
                onChange={setStartDate}
              />
              {startDate !== null && (
                <TimePicker
                  label="Start Time"
                  flex="grow"
                  onChange={setStartTime}
                />
              )}
            </Container>
            <Container
              direction="vertical"
              gap="sm"
              className="items-stretch"
              width="full"
            >
              <DatePicker label="Due Date" flex="grow" onChange={setDueDate} />
              {dueDate !== null && (
                <TimePicker
                  label="Due Time"
                  flex="grow"
                  onChange={setDueTime}
                />
              )}
            </Container>
          </Grid>

          <Checkbox label="Optional task" onChange={setOptional} />
        </Container>
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
