import { utcToLocal } from "@pointwise/lib/api/date-time";
import type { TaskV2 } from "@pointwise/lib/validation/tasks-schema";

export default function TaskCardV2({ task }: { task: TaskV2 }) {
  return (
    <div>
      <h1>Task Card</h1>
      <p>Title: {task.title}</p>
      <p>Description: {task.description}</p>
      <p>XP Award: {task.xpAward}</p>
      <p>Category: {task.category}</p>
      <p>
        Start Date:{" "}
        {task.startDate ? utcToLocal(task.startDate)?.date.toString() : null}
      </p>
      <p>Has Start Time: {task.hasStartTime ? "Yes" : "No"}</p>
      <p>
        Due Date:{" "}
        {task.dueDate ? utcToLocal(task.dueDate)?.date.toString() : null}
      </p>
      <p>Has Due Time: {task.hasDueTime ? "Yes" : "No"}</p>
      <p>Completed At: {task.completedAt ? task.completedAt : null}</p>
      <p>Status: {task.status}</p>
      <p>Created At: {task.createdAt ? task.createdAt : null}</p>
      <p>Updated At: {task.updatedAt ? task.updatedAt : null}</p>
    </div>
  );
}
