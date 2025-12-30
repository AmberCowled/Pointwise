"use client";

import Page from "@pointwise/app/components/ui/Page";
import Navbar from "@pointwise/app/dashboard/navbar/Navbar";
import ProjectsOverview from "@pointwise/app/dashboard/projectsOverview/ProjectsOverview";

export default function DashboardPage() {
  return (
    <Page>
      <Navbar />
      <ProjectsOverview />
    </Page>
  );
}
