"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import TasksOverview from "@pointwise/app/dashboard/tasksOverview/TasksOverview";

export default function ProjectPage() {
  return (
    <Page>
      <Navbar />
      <TasksOverview />
    </Page>
  );
}
