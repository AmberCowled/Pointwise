"use client";

import Page from "@pointwise/app/components/ui/Page";
import NavbarV2 from "@pointwise/app/dashboardV2/navbarV2/NavbarV2";
import TasksOverview from "@pointwise/app/dashboardV2/tasksOverview/TasksOverview";

export default function ProjectPage() {
  return (
    <Page>
      <NavbarV2 />
      <TasksOverview />
    </Page>
  );
}
