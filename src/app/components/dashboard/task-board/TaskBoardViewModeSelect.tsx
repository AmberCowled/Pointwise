"use client";

import { Tabs } from "@pointwise/app/components/ui/Tabs";
import type { TaskBoardViewMode } from "./types";

export type TaskBoardViewModeSelectProps = {
  value: TaskBoardViewMode;
  onChange: (value: TaskBoardViewMode) => void;
  className?: string;
};

const VIEW_MODE_LABELS: Record<TaskBoardViewMode, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

export default function TaskBoardViewModeSelect({
  value,
  onChange,
  className,
}: TaskBoardViewModeSelectProps) {
  const tabItems = [
    { id: "day", label: VIEW_MODE_LABELS.day },
    { id: "week", label: VIEW_MODE_LABELS.week },
    { id: "month", label: VIEW_MODE_LABELS.month },
  ];

  return (
    <Tabs
      items={tabItems}
      value={value}
      onChange={(id) => onChange(id as TaskBoardViewMode)}
      variant="filter"
      size="md"
      fullWidth={false}
      className={className}
    />
  );
}
