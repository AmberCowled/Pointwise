'use client';

import TaskItem from './TaskItem';

export type TaskStatus = 'in-progress' | 'focus' | 'scheduled' | 'completed';

export type DashboardTask = {
  id: string;
  title: string;
  context?: string | null;
  category?: string | null;
  xp: number;
  status: TaskStatus;
  completed?: boolean;
  dueAt?: string | Date | null;
};

type TaskListProps = {
  tasks: DashboardTask[];
  className?: string;
  onComplete?: (task: DashboardTask) => void;
  completingTaskId?: string | null;
};

export default function TaskList({
  tasks,
  className,
  onComplete,
  completingTaskId,
}: TaskListProps) {
  const listClassName = ['mt-5 space-y-4', className].filter(Boolean).join(' ');

  return (
    <ul className={listClassName}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={onComplete}
          isProcessing={completingTaskId === task.id}
        />
      ))}
    </ul>
  );
}
