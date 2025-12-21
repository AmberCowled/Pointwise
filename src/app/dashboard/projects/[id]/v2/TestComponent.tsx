"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { useGetProjectQuery } from "@pointwise/lib/redux/services/projectsApi";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
} from "@pointwise/lib/redux/services/tasksApi";

export default function TestComponent({ projectId }: { projectId: string }) {
  const { data: project } = useGetProjectQuery(projectId);
  const tasks = useGetTasksQuery({ projectId });
  console.log(tasks);
  console.log(projectId);
  const [createTask] = useCreateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  return (
    <div>
      Project: {project?.project.name} - Tasks: {tasks.data?.tasks.length ?? 0}
      <div>
        <Button
          onClick={() =>
            createTask({
              projectId: projectId,
              title: "Test",
              description: "Test",
              xpAward: 100,
              category: "Work",
              optional: false,
            })
          }
        >
          Create Task
        </Button>
      </div>
      <div>
        <h2 className="text-lg font-bold">Tasks</h2>
        {tasks.data?.tasks.map((task) => (
          <div key={task.id}>
            <ul className="py-4">
              <li>Title: {task.title}</li>
              <li>Description: {task.description}</li>
              <li>XP Award: {task.xpAward}</li>
              <li>Category: {task.category}</li>
              <li>Optional: {task.optional ? "True" : "False"}</li>
              <li>Start Date: {task.startDate}</li>
              <li>Start Time: {task.startTime}</li>
              <li>Due Date: {task.dueDate}</li>
              <li>Due Time: {task.dueTime}</li>
              <li>Completed At: {task.completedAt}</li>
              <li>Status: {task.status}</li>
              <li>Created At: {task.createdAt}</li>
              <li>Updated At: {task.updatedAt}</li>
              <li>{true}</li>
            </ul>
            <Button onClick={() => deleteTask({ taskId: task.id })}>
              Delete Task
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
