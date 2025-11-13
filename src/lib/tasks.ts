import type { DashboardTask } from '@pointwise/app/components/dashboard/TaskList';
import { toDate } from './datetime';

export function mergeTasks(
  existing: DashboardTask[],
  incoming: DashboardTask[],
) {
  const map = new Map<string, DashboardTask>();
  for (const task of existing) {
    map.set(task.id, task);
  }
  for (const task of incoming) {
    map.set(task.id, task);
  }
  const result = Array.from(map.values());
  result.sort((a, b) => {
    const aTime = getTaskSortTime(a);
    const bTime = getTaskSortTime(b);
    const aFinite = Number.isFinite(aTime);
    const bFinite = Number.isFinite(bTime);
    if (!aFinite && !bFinite) return 0;
    if (!aFinite) return 1;
    if (!bFinite) return -1;
    return (aTime ?? 0) - (bTime ?? 0);
  });
  return result;
}

export function getTaskSortTime(task: DashboardTask) {
  const start = toDate(task.startAt);
  if (start) return start.getTime();
  const due = toDate(task.dueAt);
  if (due) return due.getTime();
  return Number.POSITIVE_INFINITY;
}
