'use client';

import { useGetProjectQuery } from '@pointwise/lib/redux/services/projectsApi';
import { useGetTasksQuery, useCreateTaskMutation } from '@pointwise/lib/redux/services/tasksApi';
import { Button } from '@pointwise/app/components/ui/Button';

export default function TestComponent({ projectId, userId }: { projectId: string, userId: string }) {
  const { data: project } = useGetProjectQuery(projectId);
  const tasks = useGetTasksQuery({ projectId });
  const [createTask] = useCreateTaskMutation();
  
  return (
    <div>
    Project: {project?.project.name} - Tasks: {tasks.data?.tasks.length ?? 0}
      <div>
        <Button onClick={() => createTask({
          projectId: projectId,
          title: 'Test',
          description: 'Test',
          xpAward: 100,
          category: 'Work',
          optional: false
        })}>
          Create Task
        </Button>
      </div>
    </div>
  )
}